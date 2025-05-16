import { Helmet } from "react-helmet";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About SkyBridge - EmergencyMed Connect</title>
        <meta name="description" content="Learn about the SkyBridge hackathon team behind EmergencyMed Connect and our mission to provide satellite-powered emergency medical assistance anywhere in the world." />
      </Helmet>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About SkyBridge</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're a team of innovators dedicated to making emergency medical assistance accessible anywhere on the planet.
          </p>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-secondary-500 to-primary-600 px-6 py-8">
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            <p className="text-white/90 mt-2">
              To bridge the gap between remote locations and medical assistance using cutting-edge satellite technology and intelligent routing systems.
            </p>
          </div>
          <div className="px-6 py-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">The SkyBridge Hackathon Team</h3>
            <p className="text-gray-700 mb-6">
              Our team came together during a health innovation hackathon with a shared vision: to create a solution that could save lives in the most remote parts of the world. With backgrounds in satellite communications, emergency medicine, and software development, we built EmergencyMed Connect to address a critical need for global emergency response.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Why We Built This</h3>
            <p className="text-gray-700 mb-4">
              In emergency situations, every minute counts. Yet millions of people worldwide live or travel in areas where traditional emergency services are difficult to access. We wanted to create a platform that could:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Connect patients with medical professionals regardless of location</li>
              <li>Provide intelligently routed emergency response even in disaster zones</li>
              <li>Deliver critical medications to remote areas via drone technology</li>
              <li>Coordinate helicopter evacuations for life-threatening situations</li>
              <li>Leverage the Galileo SAR (Search and Rescue) satellite system for pinpoint accuracy</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Technology</h3>
            <p className="text-gray-700 mb-4">
              EmergencyMed Connect integrates with the Galileo SAR satellite constellation to provide:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Real-time location tracking with meter-level accuracy</li>
              <li>Global coverage, including oceans, mountains, and remote wilderness</li>
              <li>Satellite communication when cellular networks are unavailable</li>
              <li>Intelligent routing algorithms that account for terrain and accessibility</li>
              <li>Encrypted data transmission for patient privacy</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-8 border border-blue-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Join Our Mission</h3>
          <p className="text-gray-700 mb-6">
            We're constantly looking for partners, medical professionals, and technology experts to help us expand our reach and capabilities. If you're interested in contributing to our mission, please reach out through our contact page.
          </p>
          <div className="flex justify-center">
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;