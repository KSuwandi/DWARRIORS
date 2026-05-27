import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import { db } from "../services/firebase/config";

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "notification"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        setNotifications(data);
      }
    );

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id) => {
    try {
      await updateDoc(
        doc(db, "notification", id),
        {
          read: true,
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AppLayout>
      <div className="text-white">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Notifications
          </h1>

          <p className="text-gray-400 mt-2">
            Jigokubara notification center
          </p>
        </div>

        <div className="space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl p-6 border transition-all ${
                item.read
                  ? "bg-[#111111] border-gray-700"
                  : "bg-[#1A0005] border-[#7A0019]"
              }`}
            >
              <div className="flex justify-between items-start gap-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">
                      {item.title}
                    </h2>

                    {!item.read && (
                      <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="text-gray-300 mt-3">
                    {item.message}
                  </p>

                  <p className="text-gray-500 text-sm mt-4">
                    {item.type}
                  </p>
                </div>

                {!item.read && (
                  <button
                    onClick={() =>
                      markAsRead(item.id)
                    }
                    className="bg-[#7A0019] hover:bg-[#99001f] px-4 py-2 rounded-xl transition-all"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="bg-[#111111] border border-dashed border-gray-700 rounded-3xl p-10 text-center text-gray-400">
              No notifications
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}