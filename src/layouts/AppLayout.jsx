import Sidebar from "../components/layout/Sidebar";

export default function AppLayout({
  children,
}) {
  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}