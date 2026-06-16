import {
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import {
  db,
} from "../services/firebase/config";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function RoleRequestPage() {

  const {
    user,
    role,
  } = useAuth();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
  rpName,
  setRpName,
] = useState(
  user?.rpName || ""
);

  // =====================================
  // SUBMIT REQUEST
  // =====================================
  const submitRequest =
  async () => {

    try {

      if (!rpName.trim()) {

        toast.error(
          "RP Name wajib diisi"
        );

        return;
      }

      setLoading(true);

      await addDoc(
          collection(
            db,
            "role_requests"
          ),
          {
  userId:
    user.uid,

  rpName:
    rpName.trim(),

    email:
      user.email,

  requestedRole: "MEMBER",

  status:
    "pending",

  createdAt:
    serverTimestamp(),
}
        );

        toast.success(
          "Role request submitted"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed submit request"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <AppLayout>

      <div className="min-h-screen relative overflow-hidden text-white flex items-center justify-center px-6 py-16">

        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-black" />

        <div className="absolute top-[-150px] left-[-100px] w-full max-w-[400px] min-h-[400px] bg-red-700/20 blur-[140px] rounded-full" />

        <div className="absolute bottom-[-150px] right-[-100px] w-full max-w-[400px] min-h-[400px] bg-red-900/20 blur-[140px] rounded-full" />

        {/* CARD */}
        <div className="relative z-10 w-full max-w-2xl">

          <div className="bg-[#0f0b16]/90 backdrop-blur-2xl border border-red-700/30 rounded-[40px] p-10 shadow-[0_0_60px_rgba(239,68,68,0.15)]">

            {/* TOP */}
            <div className="text-center">

              <div className="inline-flex items-center gap-3 bg-red-900/20 border border-red-700/30 px-5 py-2 rounded-full mb-8">

                <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />

                <span className="text-red-300 tracking-[0.2em] uppercase text-xs">
                  DWARRIORS ORGANIZATION
                </span>

              </div>

              <h1 className="text-5xl font-black tracking-[0.15em]">

                <span className="text-white">
                  ROLE
                </span>

                <br />

                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-red-500 to-red-800">
                  REQUEST
                </span>

              </h1>

              <div className="w-32 min-h-[3px] bg-gradient-to-r from-red-500 to-red-500 rounded-full mx-auto mt-8" />

              <p className="text-gray-400 mt-8 text-lg leading-relaxed">
  Your account is currently awaiting approval
  from the DWARRIORS BOSS.
</p>

<div className="
  mt-8
  bg-red-950/20
  border border-red-700/20
  rounded-3xl
  p-5
">
  <p className="text-red-300 text-sm uppercase tracking-widest">
    Recruitment Process
  </p>

  <div className="mt-4 space-y-2 text-gray-400 text-sm">

    <div>✓ Submit Application</div>

    <div>⏳ BOSS Review</div>

    <div>✓ Member Approval</div>

    <div>✓ Access Granted</div>

  </div>
</div>

            </div>

            {/* FORM */}
            <div className="mt-12">

            <label className="text-sm text-red-300 tracking-[0.15em] uppercase">
  RP Name
</label>

<input
  type="text"
  value={rpName}
  onChange={(e) =>
    setRpName(
      e.target.value
    )
  }
  placeholder="Masukkan nama karakter GTA RP"
  className="w-full mt-4 bg-[#120d1b] border border-red-700/30 rounded-3xl px-6 py-5 outline-none text-white focus:border-red-500 transition-all"
/>

<div className="mt-3 mb-8 text-xs text-gray-400">
  Nama ini akan terlihat oleh BOSS dan digunakan sebagai identitas karakter RP.
</div>

<div className="bg-red-950/30 border border-red-700/20 rounded-3xl p-5">

  <p className="text-red-300 text-sm uppercase tracking-[0.15em]">
    Requested Role
  </p>

  <div className="mt-3 text-2xl font-black text-white">
    MEMBER
  </div>

</div>

            </div>

            

            {/* STATUS */}
            <div className="mt-8 bg-[#140f1d] border border-red-700/20 rounded-3xl p-5">

              <p className="text-gray-400 text-sm uppercase tracking-[0.15em]">
                Current Status
              </p>

              <div className="flex items-center justify-between mt-4">

                <span className="text-2xl font-bold">
                  {role}
                </span>

                <span className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 text-sm font-semibold">
                  Pending
                </span>

              </div>

            </div>

            {/* BUTTON */}
            <button
              disabled={
                loading
              }
              onClick={
                submitRequest
              }
              className="
group relative overflow-hidden
w-full mt-10

bg-gradient-to-r
from-red-950
via-red-700
to-red-500

hover:scale-[1.02]
transition-all duration-300

py-5
rounded-3xl
text-lg
font-bold

shadow-[0_0_35px_rgba(220,38,38,0.45)]
disabled:opacity-50
"
            >

              <span className="relative z-10">

                {loading
                  ? "Submitting..."
                  : "Submit Request"}

              </span>

              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-all" />

            </button>

            {/* FOOTER */}
            <div className="mt-10 text-center">

              <p className="text-gray-500 text-sm italic">
                Blood • Power • Legacy
              </p>

              <p className="text-red-400 text-xs tracking-[0.25em] mt-2 uppercase">
                DWARRIORS
              </p>

            </div>

          </div>

        </div>

      </div>

    </AppLayout>
  );
}