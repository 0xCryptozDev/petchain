// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PetChain
 * @notice ทะเบียนตัวตนและการถือทะเบียนสัตว์เลี้ยงบน Sepolia (ต้นแบบนักศึกษา)
 *         เก็บเฉพาะ digest และรหัสอ้างอิง — ห้ามเก็บเลขชิปดิบหรือข้อมูลส่วนตัวบน Chain
 *         สเปกฉบับเต็ม: Project.md §4–§9
 *         ⚠️ ยังไม่ผ่านการ compile/test จริง — ต้อง compile และทดสอบบน Remix VM ก่อน deploy
 */
contract PetChain is AccessControl {
    // ---------- Roles ----------
    bytes32 public constant VET_ROLE = keccak256("VET_ROLE");
    bytes32 public constant REVIEWER_ROLE = keccak256("REVIEWER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // อายุ proposal (วินาที) = 7 วัน
    uint64 public constant PROPOSAL_TTL = 604800;
    uint8 public constant APPROVALS_REQUIRED = 2; // 2 ใน 3

    // ---------- Status enums (Project.md §6) ----------
    enum IdentityStatus { Unverified, Verified, Uncertain }
    enum OwnershipStatus { Pending, Verified, Disputed, Rejected }
    enum RegistrationStatus { Pending, Active, Suspended, Revoked, Deceased }
    enum LostStatus { Normal, Missing }
    enum TransferStatus { None, Pending, Accepted, Cancelled, Expired }
    enum DisputeStatus { None, Submitted, UnderReview, Resolved, Unresolved, Rejected }

    /// @dev การเปลี่ยนแปลงสิทธิ์สำคัญที่ต้องอนุมัติ 2 ใน 3 เท่านั้น (Project.md §4)
    enum GovAction { ReplaceCommitteeSeat, RevokeAnimalVerification }

    /// @dev ผลการตัดสินข้อพิพาท (Project.md §7.4 — หากหลักฐานไม่พอ ห้ามเดาเจ้าของ)
    enum ResolutionOutcome { RejectClaim, ChangeHolder, MarkUnresolved }

    // ---------- Data ----------
    struct Pet {
        bytes32 profileDigest; // digest ของชุดข้อมูลโปรไฟล์ + nonce (ไม่ใช่ข้อมูลดิบ)
        address holder;        // ผู้ถือทะเบียน
        bytes32 chipToken;     // token ล่าสุดที่ผูก (HMAC จาก backend) — ไม่ใช่เลขชิปดิบ
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
        uint256 petId;
        address claimant;
        bytes32 evidenceDigest;
        DisputeStatus status;
        OwnershipStatus prevOwnership; // สถานะก่อนถูก Disputed — ใช้คืนค่าเมื่อ RejectClaim
        bool frozen;   // true ระหว่าง UnderReview — ระงับการโอน
        bool exists;
    }

    struct GovProposal {
        GovAction action;
        uint256 petId;        // ใช้กับ RevokeAnimalVerification
        address newMember;    // ใช้กับ ReplaceCommitteeSeat
        uint8 seat;           // ใช้กับ ReplaceCommitteeSeat (0..2)
        bytes32 paramsDigest; // digest เหตุผล/หลักฐานประกอบ (off-chain)
        uint64 expiry;
        uint8 approvals;
        bool executed;
    }

    struct ResolutionProposal {
        uint256 disputeId;
        ResolutionOutcome outcome;
        bytes32 reasonDigest;
        uint64 expiry;
        uint8 approvals;
        bool executed;
    }

    uint256 public petCount;
    uint256 public disputeCount;
    uint256 public govNonce;
    uint256 public resolutionNonce;

    mapping(uint256 => Pet) public pets;
    mapping(uint256 => TransferRequest) public transfers;
    mapping(uint256 => Dispute) public disputes;

    // chipToken => petId ที่ถูกผูก — กันชิปซ้ำ (Project.md §5)
    mapping(bytes32 => uint256) public chipTokenOwner;

    // คณะกรรมการ 3 บัญชี อนุมัติ 2 ใน 3 (Project.md §4)
    address[3] public committee;

    mapping(bytes32 => GovProposal) public govProposals;
    mapping(bytes32 => mapping(address => bool)) public govApproved;
    mapping(bytes32 => ResolutionProposal) public resolutionProposals;
    mapping(bytes32 => mapping(address => bool)) public resolutionApproved;

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
    event ResolutionProposed(bytes32 indexed proposalId, uint256 indexed disputeId, uint8 outcome, address indexed proposer);
    event DisputeResolved(uint256 indexed disputeId, uint8 outcome, bytes32 reasonDigest);
    event RegistrationSuspended(uint256 indexed petId, bool suspended, address indexed by, string reason);
    event VerificationRevoked(uint256 indexed petId, address indexed by, bytes32 reasonDigest);
    event RoleChanged(address indexed account, bytes32 indexed role, bool granted, address indexed by);
    event GovernanceProposed(bytes32 indexed proposalId, uint8 action, address indexed proposer);
    event GovernanceProposalApproved(bytes32 indexed proposalId, address indexed approver);
    event CommitteeChanged(uint8 indexed seat, address indexed newMember);

    // ---------- Errors ----------
    error PetNotFound(uint256 petId);
    error DisputeNotFound(uint256 disputeId);
    error ProposalNotFound(bytes32 proposalId);
    error ProposalExpired(bytes32 proposalId);
    error ProposalAlreadyExecuted(bytes32 proposalId);
    error DuplicateApproval(bytes32 proposalId, address voter);
    error NotHolder(uint256 petId, address caller);
    error NotCommittee(address caller);
    error ChipTokenAlreadyBound(bytes32 chipToken, uint256 existingPetId);
    error InvalidStatus(uint256 petId, string reason);
    error InvalidDispute(uint256 disputeId, string reason);
    error InvalidParams(string reason);

    // ---------- Modifier ----------
    modifier onlyCommittee() {
        if (!_isCommittee(msg.sender)) revert NotCommittee(msg.sender);
        _;
    }

    // ---------- Constructor ----------
    constructor(address[3] memory _committee) {
        require(
            _committee[0] != address(0) &&
            _committee[1] != address(0) &&
            _committee[2] != address(0),
            "committee has zero address"
        );
        require(
            _committee[0] != _committee[1] &&
            _committee[0] != _committee[2] &&
            _committee[1] != _committee[2],
            "committee has duplicates"
        );
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        committee = _committee;
    }

    // ---------- Admin: จัดการสิทธิ์ผู้รับรอง (การแต่งตั้ง committee ต้องผ่าน 2 ใน 3 เท่านั้น) ----------
    function grantVet(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(VET_ROLE, account);
        emit RoleChanged(account, VET_ROLE, true, msg.sender);
    }

    function grantReviewer(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(REVIEWER_ROLE, account);
        emit RoleChanged(account, REVIEWER_ROLE, true, msg.sender);
    }

    function revokeRolePublic(address account, bytes32 role) external onlyRole(ADMIN_ROLE) {
        _revokeRole(role, account);
        emit RoleChanged(account, role, false, msg.sender);
    }

    // ---------- Registration (Project.md §7.1) ----------
    /// @notice Owner ลงทะเบียน — สร้างทะเบียน Pending ยังไม่ออกบัตร
    function registerPet(bytes32 profileDigest) external returns (uint256 petId) {
        petId = ++petCount;
        pets[petId] = Pet({
            profileDigest: profileDigest,
            holder: msg.sender,
            chipToken: bytes32(0),
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

    /// @notice Vet รับรองผลตรวจชิป — token ต้องไม่ถูกผูกกับทะเบียนอื่น (กันชิปซ้ำ/คัดลอก)
    function verifyAnimal(uint256 petId, bytes32 chipToken, bytes32 evidenceDigest)
        external
        onlyRole(VET_ROLE)
    {
        Pet storage pet = _requirePet(petId);
        if (pet.hasChipToken) revert InvalidStatus(petId, "chip already verified");
        if (chipToken == bytes32(0)) revert InvalidStatus(petId, "empty chipToken");
        if (chipTokenOwner[chipToken] != 0) {
            revert ChipTokenAlreadyBound(chipToken, chipTokenOwner[chipToken]);
        }
        pet.hasChipToken = true;
        pet.chipToken = chipToken;
        pet.identity = IdentityStatus.Verified;
        chipTokenOwner[chipToken] = petId;
        emit AnimalVerified(petId, msg.sender, chipToken);
        // evidenceDigest ใช้เก็บฝั่ง backend/audit — contract ไม่เก็บเพื่อเลี่ยงข้อมูลซ้ำ
    }

    /// @notice Reviewer รับรองหลักฐานเจ้าของ — ไม่มีข้อพิพาทค้างเท่านั้น
    function verifyOwnership(uint256 petId, bytes32 evidenceDigest) external onlyRole(REVIEWER_ROLE) {
        Pet storage pet = _requirePet(petId);
        if (pet.ownership == OwnershipStatus.Disputed) revert InvalidStatus(petId, "disputed");
        pet.ownership = OwnershipStatus.Verified;
        emit OwnershipVerified(petId, msg.sender, evidenceDigest);
    }

    /// @notice ออกบัตรได้เมื่อ Identity = Verified และ Ownership = Verified เท่านั้น (Project.md §6)
    function issueCard(uint256 petId) external onlyRole(REVIEWER_ROLE) {
        Pet storage pet = _requirePet(petId);
        if (pet.identity != IdentityStatus.Verified || pet.ownership != OwnershipStatus.Verified) {
            revert InvalidStatus(petId, "not fully verified");
        }
        pet.registration = RegistrationStatus.Active;
        unchecked { pet.cardVersion += 1; }
        emit CardIssued(petId, pet.cardVersion, msg.sender);
    }

    // ---------- Transfer สองฝ่าย (Project.md §7.3) ----------
    function requestTransfer(uint256 petId, address recipient, uint64 expiry) external {
        Pet storage pet = _requirePet(petId);
        if (msg.sender != pet.holder) revert NotHolder(petId, msg.sender);
        if (recipient == address(0) || recipient == msg.sender) revert InvalidStatus(petId, "bad recipient");
        if (expiry <= block.timestamp) revert InvalidStatus(petId, "expiry in the past");
        _requireTransferable(petId, pet);
        TransferRequest storage t = transfers[petId];
        if (t.status == TransferStatus.Pending) revert InvalidStatus(petId, "transfer already pending");
        transfers[petId] = TransferRequest({recipient: recipient, expiry: expiry, status: TransferStatus.Pending});
        emit TransferRequested(petId, msg.sender, recipient, expiry);
    }

    function acceptTransfer(uint256 petId) external {
        Pet storage pet = _requirePet(petId);
        TransferRequest storage t = transfers[petId];
        if (t.status != TransferStatus.Pending) revert InvalidStatus(petId, "no pending transfer");
        if (msg.sender != t.recipient) revert InvalidStatus(petId, "not designated recipient");
        // หมดอายุ: revert (สถานะ Expired ให้ client อนุญาติจาก block.timestamp > expiry —
        // การเขียนสถานะก่อน revert จะถูก rollback ทั้งหมดอยู่แล้ว)
        if (block.timestamp > t.expiry) revert InvalidStatus(petId, "request expired");
        _requireTransferable(petId, pet); // ตรวจสิทธิ์/สถานะซ้ำ ณ เวลารับ (Project.md §7.3)
        address previous = pet.holder;
        pet.holder = msg.sender;
        t.status = TransferStatus.Accepted;
        unchecked { pet.cardVersion += 1; } // บัตรรุ่นเก่ากลายเป็น Superseded
        emit TransferAccepted(petId, previous, msg.sender, pet.cardVersion);
    }

    function cancelTransfer(uint256 petId) external {
        Pet storage pet = _requirePet(petId);
        if (msg.sender != pet.holder) revert NotHolder(petId, msg.sender);
        TransferRequest storage t = transfers[petId];
        if (t.status != TransferStatus.Pending) revert InvalidStatus(petId, "no pending transfer");
        t.status = TransferStatus.Cancelled;
        emit TransferCancelled(petId, msg.sender);
    }

    // ---------- Lost & Found (Project.md §7.5) ----------
    function reportMissing(uint256 petId) external {
        Pet storage pet = _requirePet(petId);
        if (msg.sender != pet.holder) revert NotHolder(petId, msg.sender);
        if (pet.lost == LostStatus.Missing) revert InvalidStatus(petId, "already missing");
        pet.lost = LostStatus.Missing;
        _cancelPendingTransfer(petId); // สัตว์หายระหว่างรอโอน => ยกเลิกคำขอ (Invariant §9)
        emit MissingReported(petId, true, msg.sender);
    }

    /// @notice ผู้ถือทะเบียนหรือ Vet — ปลด Missing แต่ไม่ปลดข้อพิพาทอื่นอัตโนมัติ
    function reportFound(uint256 petId) external {
        Pet storage pet = _requirePet(petId);
        if (msg.sender != pet.holder && !hasRole(VET_ROLE, msg.sender)) {
            revert InvalidStatus(petId, "not holder or vet");
        }
        if (pet.lost != LostStatus.Missing) revert InvalidStatus(petId, "not missing");
        pet.lost = LostStatus.Normal;
        emit MissingReported(petId, false, msg.sender);
    }

    // ---------- Dispute (Project.md §7.4) ----------
    /// @notice เปิดข้อพิพาท — ไม่ freeze ทันที ต้องผ่าน Reviewer คัดกรองกันกลั่นแกล้ง
    function openDispute(uint256 petId, bytes32 evidenceDigest) external returns (uint256 disputeId) {
        _requirePet(petId);
        if (evidenceDigest == bytes32(0)) revert InvalidStatus(petId, "no evidence digest");
        disputeId = ++disputeCount;
        disputes[disputeId] = Dispute({
            petId: petId,
            claimant: msg.sender,
            evidenceDigest: evidenceDigest,
            status: DisputeStatus.Submitted,
            prevOwnership: OwnershipStatus.Pending,
            frozen: false,
            exists: true
        });
        emit DisputeOpened(disputeId, petId, msg.sender);
    }

    /// @notice Reviewer คัดกรอง: รับเรื่อง => UnderReview + freeze ทะเบียน; ปฏิเสธ => Rejected
    function reviewDispute(uint256 disputeId, bool accept) external onlyRole(REVIEWER_ROLE) {
        Dispute storage d = _requireDispute(disputeId);
        if (d.status != DisputeStatus.Submitted) revert InvalidDispute(disputeId, "not in Submitted");
        if (accept) {
            d.status = DisputeStatus.UnderReview;
            d.frozen = true;
            d.prevOwnership = pets[d.petId].ownership; // จำสถานะเดิมเพื่อคืนค่าตอน RejectClaim
            pets[d.petId].ownership = OwnershipStatus.Disputed; // ระงับการโอนระหว่างพิจารณา
        } else {
            d.status = DisputeStatus.Rejected;
        }
        emit DisputeReviewed(disputeId, msg.sender, accept);
    }

    /// @notice กรรมการเสนอผลตัดสิน — proposalId ผูก (dispute, outcome, reason, nonce) กัน replay
    function proposeResolution(uint256 disputeId, ResolutionOutcome outcome, bytes32 reasonDigest)
        external
        onlyCommittee
        returns (bytes32 proposalId)
    {
        Dispute storage d = _requireDispute(disputeId);
        if (d.status != DisputeStatus.UnderReview) revert InvalidDispute(disputeId, "not under review");
        if (reasonDigest == bytes32(0)) revert InvalidDispute(disputeId, "no reason digest");
        proposalId = keccak256(abi.encode(disputeId, outcome, reasonDigest, ++resolutionNonce));
        resolutionProposals[proposalId] = ResolutionProposal({
            disputeId: disputeId,
            outcome: outcome,
            reasonDigest: reasonDigest,
            expiry: uint64(block.timestamp) + PROPOSAL_TTL,
            approvals: 0,
            executed: false
        });
        emit ResolutionProposed(proposalId, disputeId, uint8(outcome), msg.sender);
    }

    /// @notice กรรมการอนุมัติ — นับเฉพาะบัญชีต่างกัน ผลเดียวกัน 2 ใน 3 (Project.md §13 โหวตซ้ำปฏิเสธ)
    function approveResolution(bytes32 proposalId) external onlyCommittee {
        ResolutionProposal storage p = resolutionProposals[proposalId];
        _requireProposal(p.expiry, proposalId);
        if (p.executed) revert ProposalAlreadyExecuted(proposalId);
        if (resolutionApproved[proposalId][msg.sender]) revert DuplicateApproval(proposalId, msg.sender);
        resolutionApproved[proposalId][msg.sender] = true;
        unchecked { p.approvals += 1; }
        emit GovernanceProposalApproved(proposalId, msg.sender);
        if (p.approvals >= APPROVALS_REQUIRED) {
            p.executed = true;
            _executeResolution(p);
        }
    }

    function _executeResolution(ResolutionProposal storage p) internal {
        Dispute storage d = disputes[p.disputeId];
        Pet storage pet = pets[d.petId];
        if (p.outcome == ResolutionOutcome.ChangeHolder) {
            _cancelPendingTransfer(d.petId);
            pet.holder = d.claimant;
            pet.ownership = OwnershipStatus.Verified;
            unchecked { pet.cardVersion += 1; } // บัตรเดิม Superseded
        } else if (p.outcome == ResolutionOutcome.RejectClaim) {
            pet.ownership = d.prevOwnership; // คืนสถานะก่อนข้อพิพาท (ไม่ใช่ Verified หากไม่เคยรับรอง)
        } else {
            // MarkUnresolved — หลักฐานไม่พอ ห้ามเดาเจ้าของ: คงระงับการโอนต่อไป
            pet.ownership = OwnershipStatus.Disputed;
        }
        d.frozen = false;
        d.status = (p.outcome == ResolutionOutcome.MarkUnresolved)
            ? DisputeStatus.Unresolved
            : DisputeStatus.Resolved;
        emit DisputeResolved(p.disputeId, uint8(p.outcome), p.reasonDigest);
    }

    // ---------- Governance 2 ใน 3 (Project.md §4: ผู้ดูแลเดี่ยวแต่งตั้ง committee ไม่ได้) ----------
    function proposeGovernanceChange(
        GovAction action,
        uint256 petId,
        address newMember,
        uint8 seat,
        bytes32 paramsDigest
    ) external onlyCommittee returns (bytes32 proposalId) {
        if (action == GovAction.ReplaceCommitteeSeat) {
            if (seat > 2) revert InvalidParams("seat out of range");
            if (newMember == address(0) || _isCommittee(newMember)) revert InvalidParams("bad new member");
        } else if (action == GovAction.RevokeAnimalVerification) {
            _requirePet(petId);
        }
        if (paramsDigest == bytes32(0)) revert InvalidParams("no params digest");
        proposalId = keccak256(abi.encode(action, petId, newMember, seat, paramsDigest, ++govNonce));
        govProposals[proposalId] = GovProposal({
            action: action,
            petId: petId,
            newMember: newMember,
            seat: seat,
            paramsDigest: paramsDigest,
            expiry: uint64(block.timestamp) + PROPOSAL_TTL,
            approvals: 0,
            executed: false
        });
        emit GovernanceProposed(proposalId, uint8(action), msg.sender);
    }

    function approveGovernanceChange(bytes32 proposalId) external onlyCommittee {
        GovProposal storage p = govProposals[proposalId];
        _requireProposal(p.expiry, proposalId);
        if (p.executed) revert ProposalAlreadyExecuted(proposalId);
        if (govApproved[proposalId][msg.sender]) revert DuplicateApproval(proposalId, msg.sender);
        govApproved[proposalId][msg.sender] = true;
        unchecked { p.approvals += 1; }
        emit GovernanceProposalApproved(proposalId, msg.sender);
        if (p.approvals >= APPROVALS_REQUIRED) {
            p.executed = true;
            _executeGovernance(p);
        }
    }

    function _executeGovernance(GovProposal storage p) internal {
        if (p.action == GovAction.ReplaceCommitteeSeat) {
            committee[p.seat] = p.newMember;
            emit CommitteeChanged(p.seat, p.newMember);
        } else {
            // RevokeAnimalVerification — เพิกถอนผลรับรองชิป ปลด binding ให้ตรวจใหม่ได้ (Project.md §13)
            Pet storage pet = pets[p.petId];
            pet.hasChipToken = false;
            if (pet.chipToken != bytes32(0)) delete chipTokenOwner[pet.chipToken];
            pet.chipToken = bytes32(0);
            pet.identity = IdentityStatus.Unverified;
            pet.registration = RegistrationStatus.Suspended;
            _cancelPendingTransfer(p.petId);
            emit VerificationRevoked(p.petId, msg.sender, p.paramsDigest);
        }
    }

    // ---------- Suspension ----------
    function suspendRegistration(uint256 petId, bool suspended, string calldata reason)
        external
        onlyRole(REVIEWER_ROLE)
    {
        Pet storage pet = _requirePet(petId);
        pet.registration = suspended ? RegistrationStatus.Suspended : RegistrationStatus.Active;
        if (suspended) _cancelPendingTransfer(petId); // ระงับ => ยกเลิกคำขอโอนค้าง (Invariant §9)
        emit RegistrationSuspended(petId, suspended, msg.sender, reason);
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

    /// @notice สถานะบัตรสำหรับ public QR (Project.md §7.2): 0=Valid 1=Suspended 2=Revoked 3=Superseded/ยังไม่มีบัตร
    function getCardStatus(uint256 petId) external view returns (uint8 status, uint64 version) {
        Pet storage pet = _requirePet(petId);
        if (pet.registration == RegistrationStatus.Active && pet.cardVersion > 0) return (0, pet.cardVersion);
        if (pet.registration == RegistrationStatus.Suspended) return (1, pet.cardVersion);
        if (pet.registration == RegistrationStatus.Revoked) return (2, pet.cardVersion);
        return (3, pet.cardVersion);
    }

    function getTransfer(uint256 petId)
        external
        view
        returns (address recipient, uint64 expiry, TransferStatus status)
    {
        TransferRequest storage t = transfers[petId];
        return (t.recipient, t.expiry, t.status);
    }

    function getDispute(uint256 disputeId)
        external
        view
        returns (uint256 petId, address claimant, DisputeStatus status, bool frozen)
    {
        Dispute storage d = _requireDispute(disputeId);
        return (d.petId, d.claimant, d.status, d.frozen);
    }

    function getCommittee() external view returns (address[3] memory) {
        return committee;
    }

    // ---------- Internal ----------
    function _isCommittee(address account) internal view returns (bool) {
        return account == committee[0] || account == committee[1] || account == committee[2];
    }

    function _requirePet(uint256 petId) internal view returns (Pet storage pet) {
        pet = pets[petId];
        if (!pet.exists) revert PetNotFound(petId);
    }

    function _requireDispute(uint256 disputeId) internal view returns (Dispute storage d) {
        d = disputes[disputeId];
        if (!d.exists) revert DisputeNotFound(disputeId);
    }

    /// @dev expiry == 0 แปลว่า proposal ไม่มีอยู่; หมดอายุแล้ว revert (ยังไม่ลบ เก็บไว้ตรวจสอบ)
    function _requireProposal(uint64 expiry, bytes32 proposalId) internal view {
        if (expiry == 0) revert ProposalNotFound(proposalId);
        if (block.timestamp > expiry) revert ProposalExpired(proposalId);
    }

    /// @notice เงื่อนไข "ทะเบียนโอนได้" — Active, ไม่ Missing, ไม่ Disputed (ห้ามโอนเมื่อมีเหตุระงับ)
    function _requireTransferable(uint256 petId, Pet storage pet) internal view {
        if (pet.registration != RegistrationStatus.Active) revert InvalidStatus(petId, "registration not active");
        if (pet.lost == LostStatus.Missing) revert InvalidStatus(petId, "pet missing");
        if (pet.ownership == OwnershipStatus.Disputed) revert InvalidStatus(petId, "ownership disputed");
    }

    function _cancelPendingTransfer(uint256 petId) internal {
        TransferRequest storage t = transfers[petId];
        if (t.status == TransferStatus.Pending) {
            t.status = TransferStatus.Cancelled;
            emit TransferCancelled(petId, msg.sender);
        }
    }
}
