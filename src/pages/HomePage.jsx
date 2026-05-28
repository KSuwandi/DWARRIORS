import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* BACKGROUND EFFECT */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#120012] via-black to-[#09000f]" />

      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute w-[500px] h-[500px] bg-purple-700 blur-[180px] rounded-full top-[-150px] left-[-100px]" />
        <div className="absolute w-[400px] h-[400px] bg-fuchsia-700 blur-[160px] rounded-full bottom-[-120px] right-[-80px]" />
      </div>

      {/* MAIN */}
      <div className="relative z-10">

        {/* HERO */}
        <section className="min-h-screen flex items-center justify-center px-6 py-20">

          <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT CONTENT */}
            <div>

              <div className="inline-flex items-center gap-3 bg-[#1a001f]/80 border border-purple-700/30 px-5 py-2 rounded-full backdrop-blur-md mb-8">

                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />

                <span className="text-sm tracking-[0.2em] text-purple-200 uppercase">
                  JIGOKUBARA-GUMI FAMILY ROLEPLAY COMMUNITY
                </span>

              </div>

              <h1 className="text-6xl md:text-8xl font-black leading-none tracking-[0.18em]">

                <span className="text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]">
                  JIGOKU
                </span>

                <br />

                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-red-500">
                  BARA
                </span>

              </h1>

              <div className="mt-8 w-40 h-[3px] bg-gradient-to-r from-purple-500 to-red-500 rounded-full" />

              <p className="text-gray-300 text-lg md:text-xl leading-relaxed mt-10 max-w-2xl">
                Jigokubara-gumi, atau “Mawar Neraka”, adalah organisasi kriminal bergaya Yakuza yang lahir pada era 1980-an oleh Akihiro Ryu setelah kehancuran klannya di Osaka. Dengan filosofi “Yang indah juga bisa menjadi kehancuran”, keluarga ini membangun kekuasaan melalui loyalitas, kehormatan, dan kekuatan tanpa ampun. Kini Jigokubara dikenal sebagai keluarga bawah tanah yang disegani dan diwariskan turun-temurun oleh keturunan Akihiro.
              </p>

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-5 mt-12">

                <Link to="/login">

                  <button className="group relative overflow-hidden bg-gradient-to-r from-[#4d0066] via-[#7A0019] to-[#a0005a] hover:scale-105 transition-all duration-300 px-10 py-5 rounded-2xl text-xl font-bold shadow-[0_0_40px_rgba(168,85,247,0.35)]">

                    <span className="relative z-10">
                      Enter Organization
                    </span>

                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-all" />

                  </button>

                </Link>

                <button className="border border-purple-700/40 hover:border-purple-500 bg-white/5 hover:bg-white/10 transition-all duration-300 px-10 py-5 rounded-2xl text-xl font-semibold backdrop-blur-md">
                  Enjoy the Family
                </button>

              </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-5 mt-16">

                <div className="bg-white/5 border border-purple-700/20 backdrop-blur-xl rounded-3xl p-5">
                  <h2 className="text-3xl font-black text-purple-400">
                    Place
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Roxwood Island
                  </p>
                </div>

                <div className="bg-white/5 border border-purple-700/20 backdrop-blur-xl rounded-3xl p-5">
                  <h2 className="text-3xl font-black text-fuchsia-400">
                    極道
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Japanese Style
                  </p>
                </div>

                <div className="bg-white/5 border border-purple-700/20 backdrop-blur-xl rounded-3xl p-5">
                  <h2 className="text-3xl font-black text-red-400">
                    RP
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Kota Kita Roleplay
                  </p>
                </div>

              </div>

            </div>

            {/* RIGHT CONTENT */}
            <div className="relative flex justify-center">

              {/* GLOW */}
              <div className="absolute w-[500px] h-[500px] bg-purple-700/30 blur-[120px] rounded-full" />

              {/* LOGO CARD */}
              <div className="relative group">

                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-[40px] blur-xl opacity-40 group-hover:opacity-60 transition-all duration-500" />

                <div className="relative bg-[#0d0d0d]/90 border border-purple-700/30 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl">

                  {/* GANTI DENGAN LOGO KAMU */}
                  <img
                    src="https://i.ibb.co.com/tTKwhGt1/Asset-18.png"
                    alt="Jigokubara"
                    className="w-full max-w-[500px] object-contain drop-shadow-[0_0_35px_rgba(168,85,247,0.45)]"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* GALLERY */}
        <section className="px-6 pb-32">

          <div className="max-w-7xl mx-auto">

            {/* TITLE */}
            <div className="text-center mb-20">

              <p className="text-purple-400 tracking-[0.3em] uppercase text-sm">
                Gallery
              </p>

              <h2 className="text-5xl font-black mt-5">
                Jigokubara Moments
              </h2>

              <div className="w-32 h-[3px] bg-gradient-to-r from-purple-500 to-red-500 rounded-full mx-auto mt-8" />

            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

              {/* IMAGE 1 */}
              <div className="group relative overflow-hidden rounded-[32px] border border-purple-700/20 bg-[#111111]">

                <img
                  src="https://media.discordapp.net/attachments/1127587903137140809/1509578276446666923/FiveM_GTAProcess_2026-02-10_15-04-16.png?ex=6a19afd3&is=6a185e53&hm=ad1f15aed3348bf7051983d9c48bed21124d9bb7eb753acd54dd92de31897333&=&format=webp&quality=lossless&width=1521&height=856"
                  alt=""
                  className="w-full h-[420px] object-cover group-hover:scale-110 transition-all duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 p-6">

                  <p className="text-purple-300 text-sm tracking-[0.2em] uppercase">
                    Roxwood
                  </p>

                  <h3 className="text-2xl font-bold mt-2">
                    Underground Family
                  </h3>

                </div>

              </div>

              {/* IMAGE 2 */}
              <div className="group relative overflow-hidden rounded-[32px] border border-purple-700/20 bg-[#111111]">

                <img
                  src="https://media.discordapp.net/attachments/1127587903137140809/1509578276186751248/FiveM_GTAProcess_2026-02-10_15-05-02.png?ex=6a19afd3&is=6a185e53&hm=860a5b9ef063e3c53c73c0b3d8b6a66ec9a704f4c87dafff2c7434caeea29149&=&format=webp&quality=lossless&width=1521&height=856"
                  alt=""
                  className="w-full h-[420px] object-cover group-hover:scale-110 transition-all duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 p-6">

                  <p className="text-fuchsia-300 text-sm tracking-[0.2em] uppercase">
                    Mafia
                  </p>

                  <h3 className="text-2xl font-bold mt-2">
                    Elite Organization
                  </h3>

                </div>

              </div>

              {/* IMAGE 3 */}
              <div className="group relative overflow-hidden rounded-[32px] border border-purple-700/20 bg-[#111111]">

                <img
                  src="https://media.discordapp.net/attachments/1127587903137140809/1509578275645554908/FiveM_GTAProcess_2026-02-07_15-40-45.png?ex=6a19afd3&is=6a185e53&hm=6bb561a91934401a8d7c2891f42e6136ef2c0678264ab523d4095c1ee785a632&=&format=webp&quality=lossless&width=1521&height=856"
                  alt=""
                  className="w-full h-[420px] object-cover group-hover:scale-110 transition-all duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 p-6">

                  <p className="text-red-300 text-sm tracking-[0.2em] uppercase">
                    Power
                  </p>

                  <h3 className="text-2xl font-bold mt-2">
                    Shadow Empire
                  </h3>

                </div>

              </div>

              {/* IMAGE 4 */}
              <div className="group relative overflow-hidden rounded-[32px] border border-purple-700/20 bg-[#111111]">

                <img
                  src="https://media.discordapp.net/attachments/1127587903137140809/1509578275297558659/FiveM_GTAProcess_2026-02-10_15-03-28.png?ex=6a19afd3&is=6a185e53&hm=f19869d622bab92c3cabc4677d3462d155e88cf2bae2b1b27dbb71b9ecabcfcc&=&format=webp&quality=lossless&width=1521&height=856"
                  alt=""
                  className="w-full h-[420px] object-cover group-hover:scale-110 transition-all duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 p-6">

                  <p className="text-yellow-300 text-sm tracking-[0.2em] uppercase">
                    Japanese Style
                  </p>

                  <h3 className="text-2xl font-bold mt-2">
                    Jigokubara Clan
                  </h3>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}