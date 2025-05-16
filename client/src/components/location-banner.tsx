import { useState, useEffect } from "react";
import { useLocation } from "@/lib/hooks/use-location";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationBannerProps {
  className?: string;
}

const LocationBanner = ({ className = "" }: LocationBannerProps) => {
  const { location, error, getLocation, loading } = useLocation();
  
  return (
    <div className={`mb-8 p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        <MapPin className="text-secondary-500 mr-3 h-5 w-5" />
        <span className="text-gray-700">
          {loading ? "Checking your location..." : 
           error ? `Location error: ${error}` : 
           location ? `Location: ${location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}` :
           "Location access required"}
        </span>
      </div>
      <Button 
        onClick={getLocation} 
        variant="default" 
        size="sm"
        className="bg-secondary-500 hover:bg-secondary-600 text-white"
        disabled={loading}
      >
        {location ? "Update Location" : "Enable Location"}
      </Button>
    </div>
  );
};

export default LocationBanner;
