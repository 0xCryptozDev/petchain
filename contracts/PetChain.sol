// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PetChain
 * @notice ทะเบียนตัวตนและการถือทะเบียนสัตว์เลี้ยงบน Sepolia (ต้นแบบนักศึกษา)
 *         เก็บเฉพาะ digest และรหัสอ้างอิง — ห้ามเก็บเลขชิปดิบหรือข้อมูลส่วนตัวบน Chain
 *         สถานะ: โครงหลัก (skeleton) — ฟังก์ชันที่ยังไม่ implement จะ revert ด้วย NotImplemented
 *         สเปกฉบับเต็ม: Project.md §9
 */
contract PetChain is AccessControl {
    // ---------- Roles ----------
    bytes32 public constant VET_ROLE = keccak256("VET_ROLE");
    bytes32 public constant REVIEWER_ROLE = keccak256("REVIEWER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // ---------- Status enums (Project.md §6) ----------
    enum IdentityStatus { Unverified, Verified, Uncertain }
    enum OwnershipStatus { Pending, Verified, Disputed, Rejected }
    enum RegistrationStatus { Pending, Active, Suspended, Revoked, Deceased }
    enum LostStatus { Normal, Missing }
    enum TransferStatus { None, Pending, Accepted, Cancelled, Expired }
    enum DisputeStatus { None, Submitted, UnderReview, Resolved, Unresolved, Rejected }

    // ---------- Data ----------
    struct Pet {
        bytes32 profileDigest; // digest ของชุดข้อมูลโปรไฟล์ + nonce (ไม่ใช่ข้อมูลดิบ)
        address holder;        // ผู้ถือทะเบียน
        IdentityStatus identity;
        OwnershipStatus ownership;
        RegistrationStatus registration;
        LostStatus lost;
        uint64 cardVersion;
        uint64 registeredAt;
        bool hasChipToken;
        bool exists;
    }

    struct TransferRequest {
        address recipient;
        uint64 expiry;
        TransferStatus status;
    }

    struct Dispute {
        address claimant;
        bytes32 evidenceDigest;
        DisputeStatus status;
        bool frozen;
    }

    uint256 public petCount;
    uint256 public disputeCount;

    mapping(uint256 => Pet) public pets;
    mapping(uint256 => TransferRequest) public transfers;
    mapping(uint256 => Dispute) public disputes;

    // chipToken (HMAC จาก Backend) => petId ที่ถูกผูก — กันชิปซ้ำ (Project.md §5)
    mapping(bytes32 => uint256) public chipTokenOwner;

    // Committee: 3 บัญชี อนุมัติ 2 ใน 3 (Project.md §4, §9)
    address[3] public committee;

    // ---------- Events (Project.md §9) ----------
    event PetRegistered(uint256 indexed petId, address indexed holder, bytes32 profileDigest);
    event AnimalVerified(uint256 indexed petId, address indexed vet, bytes32 chipToken);
    event OwnershipVerified(uint256 indexed petId, address indexed reviewer, bytes32 evidenceDigest);
    event CardIssued(uint256 indexed petId, uint64 indexed version, address indexed reviewer);
    event TransferRequested(uint256 indexed petId, address indexed from, address indexed to, uint64 expiry);
    event TransferAccepted(uint256 indexed petId, address indexed from, address indexed to, uint64 newVersion);
    event TransferCancelled(uint256 indexed petId, address indexed by);
    event MissingReported(uint256 indexed petId, bool missing, address indexed by);
    event DisputeOpened(uint256 indexed disputeId, uint256 indexed petId, address indexed claimant);
    event DisputeReviewed(uint256 indexed disputeId, address indexed reviewer, bool accepted);
    event DisputeResolved(uint256 indexed disputeId, uint8 outcome, bytes32 reasonDigest);
    event RegistrationSuspended(uint256 indexed petId, bool suspended, address indexed by, string reason);
    event VerificationRevoked(uint256 indexed petId, address indexed by, bytes32 reasonDigest);
    event RoleChanged(address indexed account, bytes32 indexed role, bool granted, address indexed by);
    event GovernanceProposalApproved(bytes32 indexed proposalId, address indexed approver);

    // ---------- Errors ----------
    error NotImplemented(string functionName);
    error PetNotFound(uint256 petId);
    error NotHolder(uint256 petId, address caller);
    error ChipTokenAlreadyBound(bytes32 chipToken, uint256 existingPetId);
    error InvalidStatus(uint256 petId, string reason);

    // ---------- Constructor ----------
    constructor(address[3] memory _committee) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        committee = _committee;
        // TODO(jarukit): กัน committee ซ้ำ/เป็น address(0); ตั้ง VET/REVIEWER ภายหลังผ่าน governance
    }

    // ---------- Admin ----------
    function grantVet(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(VET_ROLE, account);
        emit RoleChanged(account, VET_ROLE, true, msg.sender);
    }

    function grantReviewer(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(REVIEWER_ROLE, account);
        emit RoleChanged(account, REVIEWER_ROLE, true, msg.sender);
    }

    // ---------- Registration ----------
    /// @notice Owner ลงทะเบียน — สร้างทะเบียน Pending ยังไม่ออกบัตร (Project.md §7.1)
    function registerPet(bytes32 profileDigest) external returns (uint256 petId) {
        petId = ++petCount;
        pets[petId] = Pet({
            profileDigest: profileDigest,
            holder: msg.sender,
            identity: IdentityStatus.Unverified,
            ownership: OwnershipStatus.Pending,
            registration: RegistrationStatus.Pending,
            lost: LostStatus.Normal,
            cardVersion: 0,
            registeredAt: uint64(block.timestamp),
            hasChipToken: false,
            exists: true
        });
        emit PetRegistered(petId, msg.sender, profileDigest);
    }

    /// @notice Vet รับรองผลตรวจชิป — token ต้องไม่ถูกผูกกับทะเบียนอื่น (กันชิปซ้ำ)
    function verifyAnimal(uint256 petId, bytes32 chipToken, bytes32 evidenceDigest)
        external
        onlyRole(VET_ROLE)
    {
        Pet storage pet = _requirePet(petId);
        if (pet.hasChipToken) revert InvalidStatus(petId, "chip already verified");
        if (chipTokenOwner[chipToken] != 0) revert ChipTokenAlreadyBound(chipToken, chipTokenOwner[chipToken]);

        pet.hasChipToken = true;
        pet.identity = IdentityStatus.Verified;
        chipTokenOwner[chipToken] = petId;
        // TODO(jarukit): เก็บ evidenceDigest สำหรับ audit
        emit AnimalVerified(petId, msg.sender, chipToken);
    }

    /// @notice Reviewer รับรองหลักฐานเจ้าของ (Project.md §9)
    function verifyOwnership(uint256 petId, bytes32 evidenceDigest) external onlyRole(REVIEWER_ROLE) {
        Pet storage pet = _requirePet(petId);
        if (pet.ownership == OwnershipStatus.Disputed) revert InvalidStatus(petId, "disputed");
        pet.ownership = OwnershipStatus.Verified;
        emit OwnershipVerified(petId, msg.sender, evidenceDigest);
    }

    /// @notice ออกบัตรได้เมื่อ Identity = Verified, Ownership = Verified เท่านั้น (Project.md §6)
    function issueCard(uint256 petId) external onlyRole(REVIEWER_ROLE) {
        Pet storage pet = _requirePet(petId);
        if (pet.identity != IdentityStatus.Verified || pet.ownership != OwnershipStatus.Verified) {
            revert InvalidStatus(petId, "not fully verified");
        }
        pet.registration = RegistrationStatus.Active;
        unchecked { pet.cardVersion += 1; }
        emit CardIssued(petId, pet.cardVersion, msg.sender);
    }

    // ---------- Transfer ----------
    function requestTransfer(uint256 petId, address recipient, uint64 expiry)
        external
        returns (bool)
    {
        revert NotImplemented("requestTransfer");
        // TODO(jarukit): เฉพาะผู้ถือทะเบียน; ห้ามเมื่อ Missing/Suspended/Disputed/Revoked/Deceased;
        //                 expiry > block.timestamp; สถานะเดิมต้องไม่ Pending (Project.md §7.3)
    }

    function acceptTransfer(uint256 petId) external returns (bool) {
        revert NotImplemented("acceptTransfer");
        // TODO(jarukit): เฉพาะผู้รับที่ระบุไว้; ตรวจ expiry; ตรวจสถานะซ้ำ;
        //                 เพิ่ม cardVersion; ยกเลิกคำขอเดิมอัตโนมัติเมื่อระงับ/เปลี่ยนเจ้าของ (Invariant §9)
    }

    function cancelTransfer(uint256 petId) external {
        revert NotImplemented("cancelTransfer");
        // TODO(jarukit): เฉพาะผู้ส่งคำขอ; อนุญาตเฉพาะสถานะ Pending
    }

    // ---------- Lost & Found ----------
    function reportMissing(uint256 petId) external {
        revert NotImplemented("reportMissing");
        // TODO(jarukit): เฉพาะผู้ถือทะเบียน; ตั้ง lost = Missing; ยกเลิกคำขอโอนค้าง (Project.md §7.5)
    }

    function reportFound(uint256 petId) external {
        revert NotImplemented("reportFound");
        // TODO(jarukit): ผู้ถือทะเบียนหรือ Vet; ปลด Missing แต่ไม่ปลดข้อพิพาทอื่นอัตโนมัติ
    }

    // ---------- Dispute ----------
    function openDispute(uint256 petId, bytes32 evidenceDigest) external returns (uint256 disputeId) {
        revert NotImplemented("openDispute");
        // TODO(jarukit): สร้าง Submitted — ไม่ freeze ทันที (กันกลั่นแกล้ง, Project.md §7.4)
    }

    function reviewDispute(uint256 disputeId, bool accept) external onlyRole(REVIEWER_ROLE) {
        revert NotImplemented("reviewDispute");
        // TODO(jarukit): รับเรื่อง => UnderReview + freeze ทะเบียน; ปฏิเสธ => Rejected
    }

    function proposeResolution(uint256 disputeId, uint8 outcome, bytes32 reasonDigest) external {
        revert NotImplemented("proposeResolution");
    }

    function approveResolution(uint256 disputeId, uint8 outcome) external {
        revert NotImplemented("approveResolution");
        // TODO(jarukit): Committee เท่านั้น; นับเฉพาะ 2 ใน 3 บัญชีต่างกัน ผลเดียวกัน;
        //                 ผูก proposal ID + action + version + expiry กัน replay (Project.md §9 Invariant)
    }

    // ---------- Governance (2 ใน 3) ----------
    function proposeGovernanceChange(bytes32 actionDigest) external returns (bytes32 proposalId) {
        revert NotImplemented("proposeGovernanceChange");
        // TODO(jarukit): ใช้เปลี่ยนคณะกรรมการ/สิทธิ์สำคัญ — ผู้ดูแลเดี่ยวห้ามแต่งตั้ง committee ใหม่เอง (Project.md §4)
    }

    function approveGovernanceChange(bytes32 proposalId) external {
        revert NotImplemented("approveGovernanceChange");
    }

    // ---------- Suspension ----------
    function suspendRegistration(uint256 petId, bool suspended, string calldata reason)
        external
        onlyRole(REVIEWER_ROLE)
    {
        Pet storage pet = _requirePet(petId);
        pet.registration = suspended ? RegistrationStatus.Suspended : RegistrationStatus.Active;
        emit RegistrationSuspended(petId, suspended, msg.sender, reason);
        // TODO(jarukit): การ suspend ต้องยกเลิกคำขอโอนค้างด้วย (Invariant §9)
    }

    // ---------- Public read ----------
    function getPet(uint256 petId)
        external
        view
        returns (
            address holder,
            IdentityStatus identity,
            OwnershipStatus ownership,
            RegistrationStatus registration,
            LostStatus lost,
            uint64 cardVersion
        )
    {
        Pet storage pet = _requirePet(petId);
        return (pet.holder, pet.identity, pet.ownership, pet.registration, pet.lost, pet.cardVersion);
    }

    /// @notice สถานะบัตรสำหรับ public QR verification (Project.md §7.2)
    function getCardStatus(uint256 petId) external view returns (uint8 status, uint64 version) {
        Pet storage pet = _requirePet(petId);
        // 0=Valid 1=Suspended 2=Revoked 3=Superseded (version ยังไม่ออกบัตร)
        if (pet.registration == RegistrationStatus.Active && pet.cardVersion > 0) {
            return (0, pet.cardVersion);
        }
        if (pet.registration == RegistrationStatus.Suspended) return (1, pet.cardVersion);
        if (pet.registration == RegistrationStatus.Revoked) return (2, pet.cardVersion);
        return (3, pet.cardVersion);
    }

    // ---------- Internal ----------
    function _requirePet(uint256 petId) internal view returns (Pet storage pet) {
        pet = pets[petId];
        if (!pet.exists) revert PetNotFound(petId);
    }
}
