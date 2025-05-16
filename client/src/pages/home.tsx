import { useEffect } from "react";
import { useLocation } from "@/lib/hooks/use-location";
import LocationBanner from "@/components/location-banner";
import EmergencyCard from "@/components/emergency-card";
import { emergencyTypes } from "@/lib/emergency-types";
import { Helmet } from "react-helmet";

const Home = () => {
  const { getLocation } = useLocation();
  
  useEffect(() => {
    // Try to get location when the page loads
    getLocation();
  }, [getLocation]);

  return (
    <>
      <Helmet>
        <title>EmergencyMed Connect - Satellite Medical Assistance</title>
        <meta name="description" content="Get emergency medical assistance anywhere in the world with satellite connectivity. Choose from five levels of medical support based on your situation." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Emergency Medical Assistance</h2>
          <p className="text-xl text-gray-600">Select the type of medical assistance you need:</p>
        </div>

        <LocationBanner />

        {/* Emergency Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {emergencyTypes.map((type) => (
            <EmergencyCard key={type.id} type={type} />
          ))}
        </div>

        <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h3>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>Select the type of emergency assistance you need</li>
            <li>Share your location and provide details about your situation</li>
            <li>Our system analyzes your needs and location data</li>
            <li>Receive appropriate assistance based on your specific emergency</li>
            <li>Track the status of your emergency request in real-time</li>
          </ol>
        </div>
      </div>
    </>
  );
};

export default Home;
