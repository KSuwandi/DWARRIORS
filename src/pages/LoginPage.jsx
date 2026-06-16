
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center px-6">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#120000] to-black" />

      {/* RED GLOW TOP LEFT */}
      <div className="absolute top-[-150px] left-[-120px] w-[500px] h-[500px] bg-red-700/20 blur-[150px] rounded-full" />

      {/* RED GLOW BOTTOM RIGHT */}
      <div className="absolute bottom-[-150px] right-[-120px] w-[500px] h-[500px] bg-red-900/20 blur-[150px] rounded-full" />

      {/* GRID */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* RED ATMOSPHERE */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.25)_0%,transparent_60%)]" />

      {/* CARD */}
      <motion.div
        initial={{
          opacity: 0,
          y: 50,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.7,
        }}
        className="relative z-10 w-full max-w-md"
      >

        {/* OUTER GLOW */}
        <div className="absolute inset-0 bg-red-600/20 blur-[60px] rounded-[40px]" />

        {/* MAIN CARD */}
        <div
          className="
            relative
            overflow-hidden
            rounded-[36px]
            border
            border-red-700/30
            bg-black/45
            backdrop-blur-2xl
            p-10
            shadow-[0_0_60px_rgba(220,38,38,0.2)]
          "
        >

          {/* TOP LINE */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-80" />

          {/* LOGO */}
          <div className="flex justify-center">

            <div className="relative">

              <img
                src="https://i.ibb.co.com/nMrw6G4N/logodw.png"
                alt="DWARRIORS"
                className="
                  w-40
                  object-contain
                  drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]
                "
              />

              <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />

            </div>

          </div>

          {/* TITLE */}
          <div className="flex justify-center">
  <h1
    className="
      mt-6

      text-4xl
      md:text-5xl

      font-black

      uppercase

      tracking-[0.03em]

      bg-gradient-to-b
      from-red-300
      via-red-500
      to-red-900

      bg-clip-text
      text-transparent
    "
    style={{
      WebkitTextStroke: "1.5px rgba(80,0,0,0.8)",
      textShadow: `
        0 2px 0 rgba(255,255,255,0.15),
        0 4px 0 rgba(120,0,0,0.7),
        0 10px 20px rgba(0,0,0,0.6),
        0 0 25px rgba(245, 245, 245, 0.8),
        0 0 50px rgba(220,38,38,0.5)
      `
    }}
  >
    DWARRIORS
  </h1>
</div>

          {/* SUBTITLE */}
          <p
            className="
              mt-3
              text-center
              text-red-400
              tracking-[0.45em]
              uppercase
              text-sm
              font-semibold
            "
          >
            BLOOD • POWER • LEGACY
          </p>

          {/* DIVIDER */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent my-8" />

          {/* DESCRIPTION */}
          <p
            className="
              text-center
              text-gray-300
              text-sm
              leading-7
            "
          >
            Welcome to DWARRIORS Organization.
            <br />
            Login using your Google account to access the community portal.
          </p>

          {/* LOGIN BUTTON */}
          <button
            onClick={loginWithGoogle}
            className="
              group
              relative
              overflow-hidden

              w-full
              mt-10

              rounded-2xl

              bg-gradient-to-r
              from-red-950
              via-red-700
              to-red-500

              py-4

              text-white
              font-bold
              tracking-wider

              transition-all
              duration-300

              hover:scale-[1.02]
              hover:shadow-[0_0_40px_rgba(220,38,38,0.6)]
            "
          >

            {/* BUTTON SHINE */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/10" />

            <span className="relative z-10">
              ENTER DWARRIORS
            </span>

          </button>

          {/* FOOTER */}
          <div className="mt-8 text-center">

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.35em]
                text-red-400/40
              "
            >
              DWARRIORS FAMILY • ROLEPLAY ORGANIZATION
            </p>

          </div>

        </div>

      </motion.div>

    </div>
  );
}

