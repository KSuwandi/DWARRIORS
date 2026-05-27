import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  auth,
  db,
} from "../services/firebase/config";

const AuthContext = createContext();

export const useAuth = () =>
  useContext(AuthContext);

const googleProvider =
  new GoogleAuthProvider();

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [role, setRole] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const loginWithGoogle =
    async () => {
      try {
        const result =
          await signInWithPopup(
            auth,
            googleProvider
          );

        const firebaseUser =
          result.user;

        const userRef = doc(
          db,
          "users",
          firebaseUser.uid
        );

        const userSnap =
          await getDoc(userRef);

        /*
          USER BARU
        */
        if (!userSnap.exists()) {
          /*
            GANTI EMAIL INI
            DENGAN EMAIL GOOGLE KAMU
          */

          const isOyabun =
            firebaseUser.email ===
            "kevinsports05@gmail.com";

          const newRole =
            isOyabun
              ? "Oyabun"
              : "Shatei";

          await setDoc(userRef, {
            uid: firebaseUser.uid,

            name:
              firebaseUser.displayName ||
              "Unknown",

            email:
              firebaseUser.email,

            photo:
              firebaseUser.photoURL ||
              "",

            role: newRole,

            debtLimit:
              newRole === "Oyabun"
                ? 999999999
                : 500000,

            totalDebt: 0,

            status: "Active",

            createdAt:
              serverTimestamp(),
          });

          setRole(newRole);
        } else {
          /*
            USER SUDAH ADA
          */

          const userData =
            userSnap.data();

          setRole(userData.role);
        }
      } catch (error) {
        console.error(error);

        alert(
          "Failed to login with Google"
        );
      }
    };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          setUser(currentUser);

          if (currentUser) {
            try {
              const userRef = doc(
                db,
                "users",
                currentUser.uid
              );

              const userSnap =
                await getDoc(userRef);

              if (
                userSnap.exists()
              ) {
                const userData =
                  userSnap.data();

                setRole(
                  userData.role
                );
              }
            } catch (error) {
              console.error(error);
            }
          } else {
            setRole(null);
          }

          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}