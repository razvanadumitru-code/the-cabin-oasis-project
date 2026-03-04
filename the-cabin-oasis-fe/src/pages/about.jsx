import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import firstAboutImage from '../images/first_about.png';
import secondAboutImage from '../images/second_about.png';
import thirdAboutImage from '../images/third_about.png';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-12">
          <h1 className="text-center text-fern-400 mb-12 sm:mb-16 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            About The Cabin Oasis
          </h1>
          
          {/* Section 1: Image-Right / Text-Left */}
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="flex-1 min-w-0 p-6 sm:p-8 border-2 border-green-600 rounded-lg bg-green-900/92 transition-all hover:border-transparent hover:bg-gradient-to-b hover:from-green-700/95 hover:to-green-800/95 hover:transform hover:-translate-y-1 hover:shadow-xl cursor-pointer group">
              <h2 className="text-green-600 mb-4 sm:mb-6 text-xl sm:text-2xl lg:text-3xl font-bold leading-tight group-hover:text-white transition-colors">Our Story</h2>
              <p className="text-green-700 leading-relaxed text-base sm:text-lg group-hover:text-white transition-colors">
                Nestled in the heart of the forest, The Cabin Oasis was born from a simple idea: to create a retreat where modern comfort meets the raw beauty of nature. Our founders, avid nature lovers, wanted to build a place where guests could disconnect from the digital world and reconnect with themselves and the natural world around them.
              </p>
            </div>
            <div className="flex-1 flex justify-end min-w-0 mt-6 lg:mt-0">
              <img
                className="w-full max-w-md h-72 sm:h-80 rounded-2xl shadow-lg object-cover object-center hover:scale-105 transition-transform duration-300"
                src={firstAboutImage}
                alt="Cabin in the forest"
              />
            </div>
          </div>

          {/* Section 2: Text-Right / Image-Left */}
          <div className="flex flex-col lg:flex-row-reverse gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="flex-1 min-w-0 p-6 sm:p-8 border-2 border-green-600 rounded-lg bg-green-900/92 transition-all hover:border-transparent hover:bg-gradient-to-b hover:from-green-700/95 hover:to-green-800/95 hover:transform hover:-translate-y-1 hover:shadow-xl cursor-pointer group">
              <h2 className="text-green-600 mb-4 sm:mb-6 text-xl sm:text-2xl lg:text-3xl font-bold leading-tight group-hover:text-white transition-colors">Our Philosophy</h2>
              <p className="text-green-700 leading-relaxed text-base sm:text-lg group-hover:text-white transition-colors">
                We believe in sustainable luxury and responsible tourism. Each of our cabins is designed with eco-friendly materials and powered by renewable energy sources. We work closely with local communities to ensure our presence benefits both our guests and the environment.
              </p>
            </div>
            <div className="flex-1 flex justify-end min-w-0 mt-6 lg:mt-0">
              <img
                className="w-full max-w-md h-72 sm:h-80 rounded-2xl shadow-lg object-cover object-center hover:scale-105 transition-transform duration-300"
                src={secondAboutImage}
                alt="Eco-friendly cabin interior"
              />
            </div>
          </div>

          {/* Section 3: Image-Right / Text-Left */}
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="flex-1 min-w-0 p-6 sm:p-8 border-2 border-green-600 rounded-lg bg-green-900/92 transition-all hover:border-transparent hover:bg-gradient-to-b hover:from-green-700/95 hover:to-green-800/95 hover:transform hover:-translate-y-1 hover:shadow-xl cursor-pointer group">
              <h2 className="text-green-600 mb-4 sm:mb-6 text-xl sm:text-2xl lg:text-3xl font-bold leading-tight group-hover:text-white transition-colors">Your Experience</h2>
              <p className="text-green-700 leading-relaxed text-base sm:text-lg group-hover:text-white transition-colors">
                Whether you're seeking adventure or tranquility, The Cabin Oasis offers something for everyone. From guided nature walks to cozy evenings by the fireplace, every moment is designed to help you unwind and create lasting memories.
              </p>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end items-center min-w-0 mt-6 lg:mt-0">
              <img
                className="w-full max-w-md h-72 sm:h-80 rounded-2xl shadow-lg object-cover object-center hover:scale-105 transition-transform duration-300"
                src={thirdAboutImage}
                alt="Guests enjoying cabin amenities"
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center px-4 sm:px-8 lg:px-16 mb-12 sm:mb-16">
          <Link 
            to="/rooms" 
            className="bg-fern-400 hover:bg-fern-500 text-pine_teal-900 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all hover:transform hover:-translate-y-1 hover:shadow-xl shadow-fern-400/50 whitespace-nowrap relative overflow-hidden"
          >
            Explore our cabins
          </Link>
        </div>
      </main>
    </div>
  );
}
