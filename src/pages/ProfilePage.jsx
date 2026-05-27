import {
  useEffect,
  useRef,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import { db } from "../services/firebase/config";

import { useAuth } from "../contexts/AuthContext";

export default function ProfilePage() {

  const { user } = useAuth();

  const fileInputRef =
    useRef(null);

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [newName, setNewName] =
    useState("");

  const [newPhone, setNewPhone] =
    useState("");

  // =====================================
  // IMGBB API
  // =====================================
  const IMGBB_API_KEY =
    "699c6fb5dc80bf81c0f7251767598e13";

    // =====================================
  // MASK EMAIL
  // =====================================
  const maskEmail = (email) => {

    if (!email) return "";

    const [username, domain] =
      email.split("@");

    if (
      username.length <= 2
    ) {

      return `${username[0]}***@${domain}`;
    }

    const firstChar =
      username[0];

    const lastTwoChars =
      username.slice(-2);

    const masked =
      "*".repeat(
        username.length - 3
      );

    return `${firstChar}${masked}${lastTwoChars}@${domain}`;
  };


  // =====================================
  // REALTIME PROFILE
  // =====================================
  useEffect(() => {

    if (!user) return;

    const unsubscribe =
      onSnapshot(
        doc(
          db,
          "users",
          user.uid
        ),
        (snapshot) => {

          if (
            snapshot.exists()
          ) {

            const data =
              snapshot.data();

            setProfile(data);

            setNewName(
              data.name || ""
            );

            setNewPhone(
              data.phone || ""
            );
          }
        }
      );

    return () =>
      unsubscribe();

  }, [user]);

  // =====================================
  // UPDATE PROFILE
  // =====================================
  const handleUpdateProfile =
    async () => {

      try {

        if (
          !newName.trim()
        ) {

          toast.error(
            "Name cannot be empty"
          );

          return;
        }

        if (
          newPhone &&
          newPhone.trim().length < 2
        ) {

          toast.error(
            "Phone number too short"
          );

          return;
        }

        setLoading(true);

        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {
            name:
              newName.trim(),

            phone:
              newPhone
                .trim(),

            updatedAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Profile updated successfully"
        );

        setEditing(false);

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed updating profile"
        );

      } finally {

        setLoading(false);
      }
    };

  // =====================================
  // UPDATE PHOTO USING IMGBB
  // =====================================
  const handleChangePhoto =
    async (e) => {

      try {

        const file =
          e.target.files?.[0];

        if (!file) return;

        setLoading(true);

        // VALIDATION
        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          toast.error(
            "File must be image"
          );

          setLoading(false);

          return;
        }

        // MAX SIZE 5MB
        if (
          file.size >
          5 * 1024 * 1024
        ) {

          toast.error(
            "Image max 5MB"
          );

          setLoading(false);

          return;
        }

        // FORM DATA
        const formData =
          new FormData();

        formData.append(
          "image",
          file
        );

        // UPLOAD TO IMGBB
        const response =
          await fetch(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            {
              method:
                "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        if (
          !data.success
        ) {

          throw new Error(
            "Failed upload image"
          );
        }

        const imageUrl =
          data.data.url;

        // SAVE TO FIREBASE
        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {
            photo:
              imageUrl,

            updatedAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Photo updated successfully"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed updating photo"
        );

      } finally {

        setLoading(false);
      }
    };

  if (!profile) {

    return (

      <AppLayout>

        <div className="text-white text-xl">
          Loading profile...
        </div>

      </AppLayout>
    );
  }

  return (

    <AppLayout>

      <div className="text-white">

        {/* PROFILE HEADER */}
        <div className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-8">

          <div className="flex flex-col lg:flex-row gap-8 items-center">

            {/* PHOTO */}
            <div className="relative">

              <img
                src={
                  profile.photo ||
                  "https://i.pravatar.cc/300"
                }
                alt="profile"
                className="w-44 h-44 rounded-3xl object-cover border-4 border-[#7A0019]"
              />

              <button
                disabled={
                  loading
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="absolute bottom-0 right-0 bg-[#7A0019] hover:bg-[#99001f] disabled:opacity-50 transition-all px-4 py-2 rounded-xl text-sm font-semibold"
              >
                {loading
                  ? "Uploading..."
                  : "Edit"}
              </button>

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept="image/*"
                className="hidden"
                onChange={
                  handleChangePhoto
                }
              />

            </div>

            {/* PROFILE INFO */}
            <div className="flex-1">

              {!editing ? (

                <>

                  <h1 className="text-5xl font-bold">
                    {
                      profile.name
                    }
                  </h1>

                  <p className="text-gray-400 mt-2">
  {maskEmail(
    profile.email
  )}
</p>

                </>

              ) : (

                <div className="max-w-xl space-y-5">

                  {/* NAME */}
                  <div>

                    <label className="text-gray-400 text-sm">
                      Character Name
                    </label>

                    <input
                      type="text"
                      value={
                        newName
                      }
                      onChange={(e) =>
                        setNewName(
                          e.target.value
                        )
                      }
                      className="w-full mt-2 bg-black border border-gray-700 rounded-2xl px-5 py-4 text-white outline-none"
                    />

                  </div>

                  {/* PHONE */}
                  <div>

                    <label className="text-gray-400 text-sm">
                      Phone Number
                    </label>

                    <input
                      type="text"
                      value={
                        newPhone
                      }
                      onChange={(e) =>
                        setNewPhone(
                          e.target.value
                        )
                      }
                      placeholder="123xx"
                      className="w-full mt-2 bg-black border border-gray-700 rounded-2xl px-5 py-4 text-white outline-none"
                    />

                  </div>

                </div>
              )}

              {/* BADGES */}
              <div className="flex flex-wrap gap-3 mt-5">

                <span className="bg-red-500/20 text-red-300 px-4 py-2 rounded-xl border border-red-500/30">
                  {
                    profile.role
                  }
                </span>

                <span className="bg-green-500/20 text-green-300 px-4 py-2 rounded-xl border border-green-500/30">
                  Online
                </span>

              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap gap-4 mt-6">

                {!editing ? (

                  <button
                    onClick={() =>
                      setEditing(
                        true
                      )
                    }
                    className="bg-[#7A0019] hover:bg-[#99001f] transition-all px-6 py-3 rounded-2xl font-semibold"
                  >
                    Edit Profile
                  </button>

                ) : (

                  <>

                    <button
                      disabled={
                        loading
                      }
                      onClick={
                        handleUpdateProfile
                      }
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-all px-6 py-3 rounded-2xl font-semibold"
                    >
                      {loading
                        ? "Saving..."
                        : "Save Changes"}
                    </button>

                    <button
                      onClick={() => {

                        setEditing(
                          false
                        );

                        setNewName(
                          profile.name ||
                            ""
                        );

                        setNewPhone(
                          profile.phone ||
                            ""
                        );
                      }}
                      className="bg-gray-700 hover:bg-gray-800 transition-all px-6 py-3 rounded-2xl font-semibold"
                    >
                      Cancel
                    </button>

                  </>

                )}

              </div>

            </div>

          </div>

        </div>

        {/* MONEY STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">

          {/* HUTANG */}
          <div className="bg-[#111111] border border-red-500/20 rounded-3xl p-6">

            <p className="text-gray-400">
              Hutang
            </p>

            <h2 className="text-4xl font-bold text-red-400 mt-3">
              Rp{" "}
              {Number(
                profile.money || 0
              ).toLocaleString(
                "id-ID"
              )}
            </h2>

          </div>

          {/* PHONE */}
          <div className="bg-[#111111] border border-yellow-500/20 rounded-3xl p-6">

            <p className="text-gray-400">
              Phone Number
            </p>

            <h2 className="text-2xl font-bold text-yellow-300 mt-3">
              {profile.phone ||
                "No Number"}
            </h2>

          </div>

        </div>

        {/* CHARACTER INFO */}
        <div className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6 mt-8">

          <h2 className="text-3xl font-bold mb-5">
            Character Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>

              <p className="text-gray-400">
                Full Name
              </p>

              <h3 className="text-2xl font-bold mt-2">
                {
                  profile.name
                }
              </h3>

            </div>

            <div>

              <p className="text-gray-400">
                Family Rank
              </p>

              <h3 className="text-2xl font-bold mt-2">
                {
                  profile.role
                }
              </h3>

            </div>

            <div>

              <p className="text-gray-400">
                Email
              </p>

              <h3 className="text-2xl font-bold mt-2">
  {maskEmail(
    profile.email
  )}
</h3>

            </div>

            <div>

              <p className="text-gray-400">
                Status
              </p>

              <h3 className="text-2xl font-bold mt-2 text-green-400">
                Active
              </h3>

            </div>

          </div>

        </div>

        {/* EXTRA STATS */}
        <div className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6 mt-8">

          <h2 className="text-3xl font-bold mb-5">
             Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* TOTAL CRAFTING */}
            <div className="bg-black rounded-2xl p-5">

              <p className="text-gray-400">
                Total Crafting
              </p>

              <h2 className="text-3xl font-bold text-yellow-400 mt-3">
                38
              </h2>

            </div>

            {/* FINANCE SCORE */}
            <div className="bg-black rounded-2xl p-5">

              <p className="text-gray-400">
                Finance Score
              </p>

              <h2 className="text-3xl font-bold text-green-400 mt-3">
                A+
              </h2>

            </div>

            {/* JOINED */}
            <div className="bg-black rounded-2xl p-5">

              <p className="text-gray-400">
                Joined Family
              </p>

              <h2 className="text-xl font-bold text-blue-400 mt-3">
                2026
              </h2>

            </div>

          </div>

        </div>

      </div>

    </AppLayout>
  );
}