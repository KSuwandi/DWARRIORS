import Sidebar from "../components/layout/Sidebar";
import { useLocation } from "react-router-dom";

export default function AppLayout({
  children,
}) {

  const location = useLocation();

  const hideSidebar =
    location.pathname === "/wardrobe";

  return (

    <div className="
      min-h-screen
      flex
      text-white
      bg-[radial-gradient(circle_at_top,#3b0000_0%,#140000_35%,#090909_100%)]
      ">

    <img
  src="https://i.ibb.co.com/gLwhkLsg/logodw-1.png"
  alt="DWARRIORS"
  className="
    fixed
    top-1/2
    left-1/2
    -translate-x-1/2
    -translate-y-1/2

    w-[900px]

    opacity-30

    blur-[1px]

    pointer-events-none

    select-none

    z-0
  "
/>


      {!hideSidebar && <Sidebar />}

      <main
        className={`overflow-y-auto relative z-10 ${
          hideSidebar
            ? "w-full p-0"
            : "flex-1 p-4 md:p-8"
        }`}
      >
        {children}
      </main>

    </div>
    
  );
}