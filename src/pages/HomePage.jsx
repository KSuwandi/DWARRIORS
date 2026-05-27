import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-white text-7xl font-bold tracking-[0.25em]">
          JIGOKUBARA
        </h1>

        <p className="text-gray-300 mt-8 text-xl">
          Luxury Yakuza Management System for GTA V Roleplay.
        </p>

        <Link to="/login">
          <button className="mt-14 bg-[#7A0019] hover:bg-[#980022] transition-all px-12 py-5 rounded-2xl text-white text-2xl font-semibold">
            Enter Organization
          </button>
        </Link>
      </div>
    </div>
  );
}