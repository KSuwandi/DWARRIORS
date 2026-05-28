import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import { db } from "../services/firebase/config";

import { useAuth } from "../contexts/AuthContext";

export default function RoleApprovalPage() {

  const { role } =
    useAuth();

  const [requests, setRequests] =
    useState([]);

  // =========================
  // LOAD REQUEST
  // =========================
  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "role_requests"
        ),
        (snapshot) => {

          setRequests(
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            )
          );
        }
      );

    return () =>
      unsubscribe();

  }, []);

  // =========================
  // APPROVE
  // =========================
  const approveRole =
    async (request) => {

      try {

        // UPDATE ROLE USER
        await updateDoc(
          doc(
            db,
            "users",
            request.userId
          ),
          {
            role:
              request.requestedRole,
          }
        );

        // UPDATE REQUEST
        await updateDoc(
          doc(
            db,
            "role_requests",
            request.id
          ),
          {
            status:
              "approved",
          }
        );

        toast.success(
          "Role approved"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed approve role"
        );
      }
    };

  // =========================
  // REJECT
  // =========================
  const rejectRole =
    async (request) => {

      try {

        await updateDoc(
          doc(
            db,
            "role_requests",
            request.id
          ),
          {
            status:
              "rejected",
          }
        );

        toast.success(
          "Request rejected"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed reject request"
        );
      }
    };

  // =========================
  // ACCESS
  // =========================
  if (role !== "Oyabun") {

    return (
      <AppLayout>
        <div className="text-white">
          Access Denied
        </div>
      </AppLayout>
    );
  }

  return (

    <AppLayout>

      <div className="text-white">

        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Role Approval
          </h1>

          <p className="text-gray-400 mt-2">
            Approve member role requests
          </p>

        </div>

        <div className="space-y-5">

          {requests.map((request) => (

            <div
              key={request.id}
              className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6"
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <div>

                  <h2 className="text-2xl font-bold">
                    {request.name}
                  </h2>

                  <p className="text-gray-400 mt-1">
                    {request.email}
                  </p>

                  <p className="mt-3">
                    Requested Role:
                    <span className="ml-2 text-red-400 font-bold">
                      {request.requestedRole}
                    </span>
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Status:
                    {" "}
                    {request.status}
                  </p>

                </div>

                {request.status ===
                  "pending" && (

                  <div className="flex gap-3">

                    <button
                      onClick={() =>
                        approveRole(
                          request
                        )
                      }
                      className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-2xl font-semibold"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        rejectRole(
                          request
                        )
                      }
                      className="bg-red-700 hover:bg-red-800 px-5 py-3 rounded-2xl font-semibold"
                    >
                      Reject
                    </button>

                  </div>
                )}

              </div>

            </div>
          ))}

          {requests.length === 0 && (

            <div className="bg-[#111111] border border-gray-800 rounded-3xl p-10 text-center text-gray-400">
              No role requests
            </div>
          )}

        </div>

      </div>

    </AppLayout>
  );
}