import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-[#150008] via-black to-black opacity-90"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-[#111111]/70 border border-[#7A0019] backdrop-blur-xl rounded-3xl p-10 w-full max-w-md shadow-2xl"
      >
        <h1 className="text-white text-4xl font-bold text-center tracking-[0.2em]">
          JIGOKUBARA
        </h1>

        <p className="text-gray-400 text-center mt-4">
          Luxury Yakuza Organization System
        </p>

        <button
          onClick={loginWithGoogle}
          className="w-full mt-10 bg-[#7A0019] hover:bg-[#980022] transition-all text-white py-4 rounded-2xl font-semibold"
        >
          Login With Google
        </button>
      </motion.div>
    </div>
  );
}