import {
  LayoutDashboard,
  Boxes,
  Wallet,
  Hammer,
  Users,
  User,
  LogOut,
  ClipboardList,
  ClipboardCheck,
  Bell,
  Trash2,
  ShieldCheck,
  History,
  BadgeDollarSign,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  collectionGroup,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  db,
} from "../../services/firebase/config";

export default function Sidebar() {

  const {
    user,
    role,
    logout,
  } = useAuth();

  // =====================================
  // NOTIFICATION STATES
  // =====================================
  const [
    craftingNotif,
    setCraftingNotif,
  ] = useState(0);

  const [
    financeNotif,
    setFinanceNotif,
  ] = useState(0);

  const [
  roleNotif,
  setRoleNotif,
] = useState(0);

  // =====================================
  // CRAFTING REQUEST NOTIFICATION
  // =====================================
  useEffect(() => {

    const craftingQuery =
      query(
        collectionGroup(
          db,
          "crafting_requests"
        ),
        where(
          "status",
          "==",
          "Pending"
        )
      );

    const unsubscribe =
      onSnapshot(
        craftingQuery,
        (snapshot) => {

          setCraftingNotif(
            snapshot.size
          );
        }
      );

    return () =>
      unsubscribe();

  }, []);

  // =====================================
  // FINANCE APPROVAL NOTIFICATION
  // =====================================
  useEffect(() => {

    const financeQuery =
      query(
        collectionGroup(
          db,
          "finance"
        ),
        where(
          "status",
          "==",
          "Pending"
        )
      );

    const unsubscribe =
      onSnapshot(
        financeQuery,
        (snapshot) => {

          setFinanceNotif(
            snapshot.size
          );
        }
      );

    return () =>
      unsubscribe();

  }, []);

  // =====================================
// ROLE APPROVAL NOTIFICATION
// =====================================
useEffect(() => {

  const roleQuery =
    query(
      collection(
        db,
        "role_requests"
      ),
      where(
        "status",
        "==",
        "pending"
      )
    );

  const unsubscribe =
    onSnapshot(
      roleQuery,
      (snapshot) => {

        setRoleNotif(
          snapshot.size
        );

      }
    );

  return () =>
    unsubscribe();

}, []);

  // =====================================
  // MENU
  // =====================================
  const menu = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
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
      icon: ClipboardList,
      path: "/crafting-requests",
      roles: [
  "BOSS",
  "UNDERBOSS",
  "CONSIGLIERE",
  "CAPO",
],
      notification:
        craftingNotif,
    },
    {
      name: "Deposit & Withdraw",
      icon: Wallet,
      path: "/finance",
    },

    {
      name: "Depo & WD Approval",
      icon: BadgeDollarSign,
      path: "/finance-approval",
      roles: [
  "BOSS",
  "UNDERBOSS",
  "CONSIGLIERE",
  "CAPO",
],
      notification:
        financeNotif,
    },

    {
      name: "Notifications",
      icon: Bell,
      path: "/notifications",
    },

    {
      name: "Profile",
      icon: User,
      path: "/profile",
    },

    {
      name: "Recycle Bin",
      icon: Trash2,
      path: "/recycle-bin",
      roles: [
  "BOSS",
  "UNDERBOSS",
  "CONSIGLIERE",
  "CAPO",
],
    },

    {
      name: "Activity Logs",
      icon: History,
      path: "/activity-logs",
      roles: [
  "BOSS",
  "UNDERBOSS",
  "CONSIGLIERE",
  "CAPO",
],
    },
    {
  name: "Recruitment",
  icon: ShieldCheck,
  path: "/role-approval",
  roles: [
  "BOSS",
  "UNDERBOSS",
  "CONSIGLIERE",
  "CAPO",
],
  notification:
    roleNotif,
},
  ];

 // =====================
// MEMBERS
// =====================
menu.push({
  name: "Members",
  icon: Users,
  path: "/members",
});

  // =====================================
  // FILTER ROLE
  // =====================================
  const filteredMenu =
    menu.filter(
      (item) => {

        if (!item.roles)
          return true;

        return item.roles.includes(
          role
        );
      }
    );

    const getRoleBadge = (role) => {

  switch (role) {

    case "BOSS":
      return {
        label: "👑 BOSS",
        className:
          "bg-red-500/20 text-red-200 border-red-400/30",
      };

    case "UNDERBOSS":
      return {
        label: "♛ UNDERBOSS",
        className:
          "bg-yellow-500/20 text-yellow-200 border-yellow-400/30",
      };

    case "CONSIGLIERE":
      return {
        label: "⚖ CONSIGLIERE",
        className:
          "bg-orange-900/30 text-orange-300 border-orange-500/30",
      };

    case "CAPO":
      return {
        label: "★ CAPO",
        className:
          "bg-green-900/30 text-green-300 border-green-500/30",
      };

    default:
      return {
        label: "● MEMBER",
        className:
          "bg-blue-800/40 text-blue-300 border-blue-500/30",
      };
  }
};

// =====================================
// ROLE PERMISSION HELPERS
// =====================================

const isBoss =
  role === "BOSS";

const isUnderboss =
  role === "UNDERBOSS";

const isConsigliere =
  role === "CONSIGLIERE";

const isCapo =
  role === "CAPO";

const isLeadership =
  isBoss ||
  isUnderboss ||
  isConsigliere ||
  isCapo;

  return (

    <aside className="w-full max-w-[320px] min-h-screen bg-gradient-to-b from-[#220000] via-[#120000]
 to-[#050505] border-r border-red-700/20 p-6 hidden md:flex flex-col relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <img
  src="https://i.ibb.co.com/nMrw6G4N/logodw.png"
  alt="DWARRIORS"
  className="
    absolute
    inset-0
    m-auto

    w-[220px]

    opacity-[0.03]

    pointer-events-none

    select-none
  "
/>
      <div className="absolute inset-0 pointer-events-none">

       <div className="absolute top-[-120px] left-[-80px] w-[300px] h-[300px] bg-red-600/25 blur-[120px] rounded-full" />

<div className="absolute bottom-[-120px] right-[-80px] w-[300px] h-[300px] bg-red-900/25 blur-[120px] rounded-full" />

        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_top,#ffffff_0%,transparent_55%)]" />

      </div>

      {/* HEADER */}
      <div className="relative z-10">

        <div className="border border-red-500/20 rounded-3xl bg-red-950/20 backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(220,38,38,0.15)]">

          <h1 className="font-[Cinzel] text-white text-[28px] leading-none font-black tracking-[0.12em] whitespace-nowrap">

            DWARRIORS

          </h1>

          <div className="mt-3 flex items-center gap-3">

            <div className="min-h-[1px] flex-1 bg-gradient-to-r from-red-500 to-transparent" />

            <span className="font[Cinzel] text-[10px] text-red-300 tracking-[0.4em]">

              DW

            </span>

          </div>

          <p className="text-red-200/70 mt-3 text-xs tracking-[0.25em] uppercase">

            WELCOME BACK, {user?.rpName?.toUpperCase() || "GUEST"}

          </p>

        </div>

      </div>

      {/* PROFILE */}
      <div className="relative z-10 mt-8 bg-red-950/20 backdrop-blur-xl border border-red-400/20 rounded-3xl p-4 shadow-[0_0_30px_rgba(220,38,38,0.15)]">

        <div className="flex items-center gap-4">

          <div className="relative">

            <div className="absolute inset-0 bg-red-500 blur-xl opacity-40 rounded-full" />

            <img
  src={
    user?.photo ||
    "https://i.pravatar.cc/150"
  }
  alt="profile"
  referrerPolicy="no-referrer"
  className="relative w-14 h-14 rounded-full border-2 border-red-400 object-cover"
/>

          </div>

          <div className="flex flex-col min-w-0">

            <h2 className="text-white font-bold text-sm truncate">
              {user?.rpName ||
                "Unknown User"}
            </h2>

            <p className="text-gray-400 text-xs truncate">
    {(() => {

      const email =
        user?.email || "";

      if (!email.includes("@"))
        return "No Email";

      const [name, domain] =
        email.split("@");

      const first =
        name.charAt(0);

      const lastTwo =
        name.slice(-2);

      const stars =
        "*".repeat(
          Math.max(
            name.length - 3,
            5
          )
        );

      return `${first}${stars}${lastTwo}@${domain}`;

    })()}
  </p>

            <span
  className={`
    mt-2
    text-[10px]
    px-3
    py-1
    rounded-full
    w-fit
    border
    font-bold
    ${getRoleBadge(role).className}
  `}
>
  {getRoleBadge(role).label}
</span>

          </div>

        </div>

      </div>

      {/* MENU */}
      <div className="relative z-10 mt-10 flex flex-col gap-3">

        {filteredMenu.map(
          (item) => (

            <NavLink
              key={item.name}
              to={item.path}
              className={({

                isActive,

              }) =>

                `group flex items-center justify-between px-4 py-4 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-red-950 via-red-800/70 to-red-600/40 border-red-400/40 text-white shadow-[0_0_20px_rgba(220,38,38,0.35)]"
                    : "bg-black/40 border-white/5 text-red-100/70 hover:bg-red-500/10 hover:border-red-400/20 hover:text-white"
                }`
              }
            >

              <div className="flex items-center gap-4">

                <item.icon
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />

                <span className="font-medium tracking-wide">
                  {item.name}
                </span>

              </div>

              {/* NOTIFICATION */}
              {item.notification >
                0 && (

                <div className="bg-gradient-to-r from-red-500 to-red-600 min-w-[24px] h-6 px-2 rounded-full flex items-center justify-center text-xs font-bold animate-pulse text-white shadow-lg shadow-red-500/30">

                  {
                    item.notification
                  }

                </div>

              )}

            </NavLink>
          )
        )}

      </div>

      {/* JAPANESE QUOTE */}
      <div className="relative z-10 mt-auto mb-6">

        <div className="border border-red-500/10 bg-red-950/20 rounded-3xl p-4 backdrop-blur-xl">

          <p className="font-[Cinzel] text-red-200 text-sm tracking-[0.25em] text-center">

  DWARRIORS

</p>

<p className="font-[Cinzel] text-gray-500 text-[10px] text-center mt-2 tracking-[0.2em] uppercase">

  Blood • Power • Legacy

</p>

        </div>

      </div>

      {/* FOOTER */}
      <div className="relative z-10">

        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-200 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-400/20 bg-black/40"
        >

          <LogOut size={20} />

          Logout

        </button>

      </div>

    </aside>
  );
}