import {
  LayoutDashboard,
  Boxes,
  Wallet,
  Hammer,
  Users,
  User,
  LogOut,
  ClipboardList,
  Bell,
  Trash2,
  ShieldCheck,
  History,
  BadgeDollarSign,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

export default function Sidebar() {

  const {
    user,
    role,
    logout,
  } = useAuth();

  // =====================================
  // MENU
  // =====================================
  const menu = [
    {
      name: "Dashboard",
      icon:
        LayoutDashboard,
      path: "/dashboard",
    },

    {
      name: "Inventory",
      icon: Boxes,
      path: "/inventory",
    },

    {
      name: "Crafting",
      icon: Hammer,
      path: "/crafting",
    },

    {
  name: "Craft Requests",
  icon:
    ClipboardList,
  path:
    "/crafting-requests",
  roles: [
    "Oyabun",
  ],
},

    {
      name: "Finance",
      icon: Wallet,
      path: "/finance",
    },

    // =====================================
    // FINANCE APPROVAL
    // HANYA OYABUN
    // =====================================
    {
      name:
        "Finance Approval",
      icon:
        BadgeDollarSign,
      path:
        "/finance-approval",
      roles: [
        "Oyabun",
      ],
    },

    {
      name:
        "Notifications",
      icon: Bell,
      path:
        "/notifications",
    },

    {
      name: "Profile",
      icon: User,
      path: "/profile",
    },

    {
      name:
        "Recycle Bin",
      icon: Trash2,
      path:
        "/recycle-bin",
    },

    {
      name:
        "Activity Logs",
      icon: History,
      path:
        "/activity-logs",
    },

    {
      name:
        "Inventory Approval",
      icon:
        ShieldCheck,
      path:
        "/inventory-approval",
      roles: [
        "Oyabun",
      ],
    },
  ];

  // =====================================
  // MEMBERS
  // =====================================
  if (
    role === "Oyabun"
  ) {

    menu.push({
      name: "Members",
      icon: Users,
      path: "/members",
      roles: [
        "Oyabun",
      ],
    });
  }

  // =====================================
  // FILTER ROLE
  // =====================================
  const filteredMenu =
    menu.filter(
      (item) => {

        if (
          !item.roles
        ) {
          return true;
        }

        return item.roles.includes(
          role
        );
      }
    );

  return (

    <aside className="w-[280px] min-h-screen bg-[#0A0A0A] border-r border-[#7A0019]/40 p-6 hidden md:flex flex-col">

      {/* LOGO */}
      <div>

        <h1 className="text-white text-3xl font-bold tracking-[0.2em]">
          JIGOKUBARA
        </h1>

        <p className="text-[#7A0019] mt-2 text-sm">
          Luxury Yakuza System
        </p>

      </div>

      {/* PROFILE */}
      <div className="mt-10 bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-4">

        <div className="flex items-center gap-4">

          <img
            src={
              user?.photoURL ||
              "https://i.pravatar.cc/150"
            }
            alt="profile"
            className="w-14 h-14 rounded-full border-2 border-[#7A0019]"
          />

          <div className="flex flex-col">

            <h2 className="text-white font-bold text-sm">
              {user?.displayName ||
                "Unknown User"}
            </h2>

            <p className="text-gray-400 text-xs">
              {user?.email}
            </p>

            <span
              className={`mt-2 text-xs px-3 py-1 rounded-full w-fit ${
                role ===
                "Oyabun"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {role}
            </span>

          </div>

        </div>

      </div>

      {/* MENU */}
      <div className="mt-10 flex flex-col gap-3">

        {filteredMenu.map(
          (item) => (

            <NavLink
              key={
                item.name
              }
              to={item.path}
              className={({
                isActive,
              }) =>
                `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#7A0019]/30 text-white border border-[#7A0019] shadow-lg shadow-[#7A0019]/10"
                    : "text-gray-300 hover:bg-[#7A0019]/20 hover:text-white"
                }`
              }
            >

              <item.icon
                size={20}
              />

              <span className="font-medium">
                {item.name}
              </span>

            </NavLink>
          )
        )}

      </div>

      {/* FOOTER */}
      <div className="mt-auto">

        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all"
        >

          <LogOut
            size={20}
          />

          Logout

        </button>

      </div>

    </aside>
  );
}