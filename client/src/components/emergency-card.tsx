import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader
} from "@/components/ui/card";
import { EmergencyType } from "@/lib/emergency-types";
import { Clock } from "lucide-react";

interface EmergencyCardProps {
  type: EmergencyType;
}

const EmergencyCard = ({ type }: EmergencyCardProps) => {
  const headerColorClasses = {
    1: "bg-blue-100",
    2: "bg-green-100",
    3: "bg-yellow-100",
    4: "bg-orange-100",
    5: "bg-red-100",
  };

  const bannerColorClasses = {
    1: "bg-secondary-500",
    2: "bg-green-500",
    3: "bg-yellow-500",
    4: "bg-orange-500",
    5: "bg-red-600",
  };

  const iconBgClasses = {
    1: "bg-blue-100 text-secondary-500",
    2: "bg-green-100 text-green-500",
    3: "bg-yellow-100 text-yellow-600",
    4: "bg-orange-100 text-orange-600",
    5: "bg-red-100 text-red-600",
  };

  return (
    <Link href={`/emergency-form/${type.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <div className={`p-1 ${headerColorClasses[type.id as keyof typeof headerColorClasses]}`}>
          <div className={`${bannerColorClasses[type.id as keyof typeof bannerColorClasses]} text-white p-2 rounded-t-lg text-center`}>
            <span className="font-semibold">Level {type.id}</span>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <div className={`h-12 w-12 rounded-full ${iconBgClasses[type.id as keyof typeof iconBgClasses]} flex items-center justify-center`}>
              {type.icon}
            </div>
            <h3 className="ml-4 text-xl font-semibold text-gray-900">{type.title}</h3>
          </div>
          <p className="text-gray-700 mb-4">{type.description}</p>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>Estimated response: {type.estimatedResponse}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EmergencyCard;
