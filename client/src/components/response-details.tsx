import { EmergencyRequest } from "@shared/schema";
import { EmergencyType } from "@/lib/emergency-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Phone, PencilLine, Satellite } from "lucide-react";

interface ResponseDetailsProps {
  request: EmergencyRequest;
  emergencyType: EmergencyType;
}

const ResponseDetails = ({ request, emergencyType }: ResponseDetailsProps) => {
  const getHeaderColor = () => {
    switch (emergencyType.id) {
      case 1: return "bg-secondary-500";
      case 2: return "bg-green-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-red-600";
      case 5: return "bg-red-600";
      default: return "bg-secondary-500";
    }
  };

  // Mock data for the response - in a real app, this would come from the backend
  const getRespondingDoctor = () => {
    return {
      name: "Dr. Sarah Johnson",
      specialty: "Emergency Medicine Specialist",
      rating: 4.7,
      consultations: 238,
    };
  };

  const getWaitingInstructions = () => {
    const baseInstructions = [
      "Stay in your current location unless it's unsafe to do so",
      "Ensure your device has adequate battery and network connection",
    ];
    
    switch (emergencyType.id) {
      case 1:
        return [
          ...baseInstructions,
          "Prepare to describe your symptoms in detail to the doctor",
          "If your condition worsens, use the SOS button immediately",
        ];
      case 2:
        return [
          ...baseInstructions,
          "Follow the directions to the nearest medical facility",
          "Call the facility ahead of time if possible",
        ];
      case 3:
        return [
          ...baseInstructions,
          "Have a valid identification ready for medication pickup",
          "Prepare a clear area for drone landing if applicable",
        ];
      case 4:
        return [
          ...baseInstructions,
          "Make yourself visible to emergency personnel if possible",
          "Try to clear a path for emergency vehicle access if safe to do so",
        ];
      case 5:
        return [
          ...baseInstructions,
          "Mark your position with bright clothing or signal if possible",
          "Move to a clear area away from trees and obstacles if safe to do so",
        ];
      default:
        return baseInstructions;
    }
  };

  const doctor = getRespondingDoctor();
  const waitingInstructions = getWaitingInstructions();
  const connectionStrength = 85; // Mock satellite connection strength

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="overflow-hidden mb-8">
        <div className={`${getHeaderColor()} text-white p-4`}>
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 mr-3" />
            <div>
              <h2 className="text-xl font-bold">Help is on the way</h2>
              <p className="text-sm opacity-90">Emergency type: {emergencyType.title}</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Support Information</h3>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    {emergencyType.id === 1 
                      ? "A doctor will connect with you via telemedicine in approximately 7 minutes."
                      : emergencyType.id === 2
                      ? "Directions to the nearest medical facility have been prepared."
                      : emergencyType.id === 3
                      ? "Medicine delivery has been scheduled. Estimated arrival in 1-3 hours."
                      : emergencyType.id === 4
                      ? "Emergency personnel have been dispatched to your location."
                      : "Helicopter evacuation has been requested. Stay in your current position."}
                  </p>
                </div>
              </div>
            </div>
            
            {emergencyType.id === 1 && (
              <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{doctor.name}</h4>
                  <p className="text-gray-600 text-sm">{doctor.specialty}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i}
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-3 w-3"
                          fill={i < Math.floor(doctor.rating) ? "currentColor" : "none"}
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">{doctor.rating} ({doctor.consultations} consultations)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Waiting Instructions</h3>
            <ul className="space-y-2 text-gray-700">
              {waitingInstructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 mt-1.5 mr-2 text-secondary-500" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="4" />
                  </svg>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Button className="bg-secondary-500 hover:bg-secondary-600 text-white py-3">
          <Phone className="mr-2 h-4 w-4" />
          Test Connection
        </Button>
        <Button variant="outline" className="border-gray-300 hover:bg-gray-50 text-gray-700 py-3">
          <PencilLine className="mr-2 h-4 w-4" />
          Update Information
        </Button>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-gray-900 flex items-center mb-2">
          <Satellite className="text-blue-500 mr-2 h-5 w-5" />
          Satellite Connection Status
        </h4>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
            <div 
              className="bg-green-500 h-2.5 rounded-full" 
              style={{ width: `${connectionStrength}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Strong ({connectionStrength}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResponseDetails;
