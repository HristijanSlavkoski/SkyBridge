import { 
  UserRound, 
  Hospital, 
  Pill, 
  Ambulance, 
  Plane
} from "lucide-react";
import React from "react";

export interface EmergencyType {
  id: number;
  title: string;
  description: string;
  estimatedResponse: string;
  icon: JSX.Element;
}

export const emergencyTypes: EmergencyType[] = [
  {
    id: 1,
    title: "Medical Consultation",
    description: "Get professional medical advice for minor issues like cough, fever, or general health concerns.",
    estimatedResponse: "5-15 minutes",
    icon: React.createElement(UserRound, { className: "text-2xl" })
  },
  {
    id: 2,
    title: "Location-Based Finder",
    description: "Find the nearest medical facility while traveling in unfamiliar locations for non-urgent care.",
    estimatedResponse: "1-5 minutes",
    icon: React.createElement(Hospital, { className: "text-2xl" })
  },
  {
    id: 3,
    title: "Medicine Delivery",
    description: "Request medicine delivery to remote locations via drone for situations where travel is difficult.",
    estimatedResponse: "1-3 hours",
    icon: React.createElement(Pill, { className: "text-2xl" })
  },
  {
    id: 4,
    title: "Emergency Personnel",
    description: "Dispatch emergency medical personnel to your location using smart navigation in disaster zones.",
    estimatedResponse: "15-60 minutes",
    icon: React.createElement(Ambulance, { className: "text-2xl" })
  },
  {
    id: 5,
    title: "Helicopter Evacuation",
    description: "Request helicopter evacuation for life-threatening emergencies in inaccessible terrain.",
    estimatedResponse: "1-4 hours",
    icon: React.createElement(Plane, { className: "text-2xl" })
  }
];

export function getEmergencyTypeById(id: number): EmergencyType | undefined {
  return emergencyTypes.find(type => type.id === id);
}
