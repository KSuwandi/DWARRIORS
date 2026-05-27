import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import { db } from "../services/firebase/config";

export default function MembersPage() {
  const [members, setMembers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        setMembers(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <AppLayout>
      <div className="text-white w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Family Members
          </h1>

          <p className="text-gray-400 mt-2">
            Jigokubara member
            management
          </p>
        </div>

        {loading ? (
          <div className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-10 text-center">
            Loading members...
          </div>
        ) : members.length === 0 ? (
          <div className="bg-[#111111] border border-dashed border-gray-700 rounded-3xl p-10 text-center text-gray-400">
            No members found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6 hover:border-[#7A0019] transition-all"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      member.photo ||
                      "https://i.imgur.com/HeIi0wU.png"
                    }
                    alt={member.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-[#7A0019]/30"
                  />

                  <div>
                    <h2 className="text-xl font-bold">
                      {member.name ||
                        "Unknown User"}
                    </h2>

                    <p className="text-gray-400 text-sm">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span
                    className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                      member.role ===
                      "Oyabun"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {member.role ||
                      "Member"}
                  </span>

                  <div className="text-sm text-gray-500">
                    ID:
                    {" "}
                    {member.id.slice(
                      0,
                      6
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}