/**
 * PetChain web — skeleton
 * โครงหน้าจอฉบับเต็ม: Project.md §12
 *  สาธารณณะ: Home, Verify Card          → features/public (norawat)
 *  Owner: Dashboard, Register, My Pets…  → features/owner  (norawat)
 *  Vet: Verification Queue, Inspection…  → features/vet    (rattanapon)
 *  Admin: Review, Dispute Queue, Vote…   → features/admin  (rattanapon)
 * Contract address ต้องมาจาก deployments/ manifest ผ่าน VITE_CONTRACT_ADDRESS — ห้าม hardcode
 */
export default function App() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">PetChain</h1>
      <p className="mt-2 text-gray-600">
        โครงโปรเจกต์ (skeleton) — ยังไม่เชื่อม contract จริง รอ deployment manifest จาก jarukit
      </p>
      {/* TODO(norawat): routing ตาม Project.md §12 + shared wallet adapter */}
    </main>
  );
}
