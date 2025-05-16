import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Phone } from "lucide-react";

const EmergencySOS = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSOSClick = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmSOS = () => {
    // In a real app, this would connect to emergency services API
    toast({
      title: "Emergency SOS triggered",
      description: "Connecting to emergency services. Please stand by.",
      variant: "destructive",
      duration: 5000,
    });
    setIsDialogOpen(false);
    
    // Simulate connecting to emergency services
    setTimeout(() => {
      toast({
        title: "Emergency services notified",
        description: "Help is on the way. Stay where you are if it's safe.",
        duration: 8000,
      });
    }, 3000);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={handleSOSClick}
          className="animate-pulse bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-full shadow-lg flex items-center"
        >
          <Phone className="mr-2 h-5 w-5" />
          SOS EMERGENCY
        </button>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Emergency SOS Alert</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately contact emergency services. Only use this feature in case of a life-threatening emergency.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSOS}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Emergency
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmergencySOS;
