import Sidebar from "../components/layout/Sidebar";

export default function AppLayout({
  children,
}) {
  return (

    <div className="min-h-screen flex text-white bg-[radial-gradient(circle_at_top,#2a1240_0%,#12091c_45%,#09040f_100%)]">

      {/* JAPANESE PATTERN OVERLAY */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asanoha-400px.png')]" />

      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto relative z-10">
        {children}
      </main>

    </div>
  );
}