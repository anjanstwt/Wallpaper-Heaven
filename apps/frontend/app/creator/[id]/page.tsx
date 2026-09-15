import NavbarMain from "@/Components/Nav-Bar/NavbarMain";
import Image from "next/image";

export default function UserWork() {
  const works = [
    { id: 1, title: "Cyberpunk UI", image: "/col1.jpeg" },
    { id: 2, title: "Minimal Dashboard", image: "/col2.jpeg" },
    { id: 3, title: "Dark Portfolio", image: "/col3.jpeg" },
    { id: 4, title: "Neon Landing", image: "/col4.jpeg" },
    { id: 5, title: "E-commerce UI", image: "/col5.jpeg" },
    { id: 6, title: "Analytics App", image: "/col1.jpeg" },
    { id: 7, title: "Gaming Profile", image: "/col2.jpeg" },
    { id: 8, title: "Stream Overlay", image: "/col3.jpeg" },
  ];

  return (
    <div className="">
      <NavbarMain/>
      <div className="flex items-start justify-between pt-20 bg-white text-black min-h-screen">
        {/* Sidebar */}
        <div className="h-full w-[20%] hidden md:flex bg-gray-800 border-r border-gray-200 p-4">
          {/* You can add sidebar content here */}
        </div>

        {/* Main Content */}
        <div className="h-full w-full md:w-[80%] flex flex-col gap-y-6 sm:gap-y-10 px-4 sm:px-6">
          <main className="w-full">
            {/* Top Section */}
            <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 sm:gap-8 mb-10 sm:mb-16">
              {/* Profile Image */}
              <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-gray-300 shadow-md flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=3540&q=80"
                  alt="Profile"
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Details */}
              <div className="flex flex-col gap-2 text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Nayan Suman</h1>
                <h2 className="text-lg sm:text-xl text-blue-600 font-medium">Senior Designer</h2>
                <p className="text-gray-600 max-w-xl text-sm sm:text-base">
                  Passionate about building interactive interior wallpapers with a traditional touch. Always learning and creating.
                </p>
              </div>
            </section>

            {/* Works Section */}
            <section className="max-w-7xl mx-auto grid gap-6 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {works.map((work) => (
                <div
                  key={work.id}
                  className="group relative overflow-hidden rounded-xl shadow-md border border-gray-200"
                >
                  <Image
                    src={work.image}
                    alt={work.title}
                    width={400}
                    height={400}
                    className="w-full h-[300px] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Title Overlay */}
                  <div className="absolute bottom-0 w-full flex justify-center items-end pb-4 text-white font-semibold text-lg h-full bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-all duration-500 group-hover:items-center group-hover:text-2xl group-hover:pb-0">
                    {work.title}
                  </div>
                </div>
              ))}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
