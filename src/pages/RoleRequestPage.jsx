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
    requestedRole,
    setRequestedRole,
  ] = useState("Shatei");

  const [
    loading,
    setLoading,
  ] = useState(false);

  // =====================================
  // SUBMIT REQUEST
  // =====================================
  const submitRequest =
    async () => {

      try {

        setLoading(true);

        await addDoc(
          collection(
            db,
            "role_requests"
          ),
          {

            userId:
              user.uid,

            name:
              user.rpName ||
              user.displayName,

            email:
              user.email,

            requestedRole,

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

      <div className="text-white max-w-2xl mx-auto">

        <div className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-8">

          <h1 className="text-4xl font-bold">
            Request Role
          </h1>

          <p className="text-gray-400 mt-2">
            Your account is waiting for approval
          </p>

          <div className="mt-8">

            <label className="text-sm text-gray-400">
              Select Role
            </label>

            <select
              value={
                requestedRole
              }
              onChange={(e) =>
                setRequestedRole(
                  e.target.value
                )
              }
              className="w-full mt-3 bg-black border border-gray-700 rounded-2xl px-5 py-4 outline-none"
            >

              <option value="Shatei">
                Shatei
              </option>

              <option value="Kepala Divisi">
                Kepala Divisi
              </option>

            </select>

          </div>

          <button
            disabled={
              loading
            }
            onClick={
              submitRequest
            }
            className="w-full mt-8 bg-[#7A0019] hover:bg-[#99001f] disabled:opacity-50 transition-all py-4 rounded-2xl font-semibold"
          >
            {loading
              ? "Submitting..."
              : "Submit Request"}
          </button>

          <div className="mt-5 text-sm text-gray-500">
            Current Status:
            <span className="text-yellow-400 ml-2">
              {role}
            </span>
          </div>

        </div>

      </div>

    </AppLayout>
  );
}