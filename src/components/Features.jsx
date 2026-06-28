import React from "react";

function Features() {
  const featuresData = [
    {
      id: 1,
      img: "/img/features/f1.png",
      title: "Free Shipping",
      bg: "bg-[#fddde4] text-[#088178] dark:bg-pink-950/40 dark:text-pink-300",
    },
    {
      id: 2,
      img: "/img/features/f2.png",
      title: "Online Order",
      bg: "bg-[#cdebbc] text-[#088178] dark:bg-green-950/40 dark:text-green-300",
    },
    {
      id: 3,
      img: "/img/features/f3.png",
      title: "Save Money",
      bg: "bg-[#d1e8f2] text-[#088178] dark:bg-blue-950/40 dark:text-blue-300",
    },
    {
      id: 4,
      img: "/img/features/f4.png",
      title: "Promotions",
      bg: "bg-[#cdd4f8] text-[#088178] dark:bg-indigo-950/40 dark:text-indigo-300",
    },
    {
      id: 5,
      img: "/img/features/f5.png",
      title: "Happy Sell",
      bg: "bg-[#f6dbf6] text-[#088178] dark:bg-purple-950/40 dark:text-purple-300",
    },
    {
      id: 6,
      img: "/img/features/f6.png",
      title: "24/7 Support",
      bg: "bg-[#fff2e5] text-[#088178] dark:bg-orange-950/40 dark:text-orange-300",
    },
  ];

  return (
    <section
      id="feature"
      className="w-full px-6 sm:px-12 md:px-20 py-12 bg-white dark:bg-zinc-950 transition-colors duration-300"
    >
      {/* Grid Alignment Wrapper */}
      <div className="flex flex-wrap items-center justify-center gap-6 md:justify-between">
        {featuresData.map((item) => (
          <div
            key={item.id}
            className="w-41.25 sm:w-45 flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.012)] dark:shadow-none hover:shadow-[0_20px_40px_rgba(8,129,120,0.08)] dark:hover:border-[#088178]/40 transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
          >
            {/* Asset Node Frame */}
            <div className="w-full mb-4 transform group-hover:scale-105 transition-transform duration-300">
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-auto object-contain mx-auto"
              />
            </div>

            {/* Dynamic Interface Badge */}
            <h6
              className={`inline-block px-3 py-1.5 text-xs font-bold rounded-md tracking-medium ${item.bg} transition-colors duration-300`}
            >
              {item.title}
            </h6>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
