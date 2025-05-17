import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Satellite, CheckCircle, AlertCircle } from "lucide-react";
import { EmergencyRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import LoadingState from "@/components/loading-state";
import NotFound from "@/pages/not-found";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

const ProcessingStep = ({
  completed,
  inProgress,
  children,
}: {
  completed: boolean;
  inProgress: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex items-center mb-3">
    <div className={`flex-shrink-0 h-5 w-5 rounded-full 
      ${completed ? "bg-green-500" : inProgress ? "bg-blue-500 animate-pulse" : "bg-gray-300"} 
      flex items-center justify-center text-white`}
    >
      {completed && <CheckCircle className="h-3 w-3" />}
    </div>
    <div className="ml-3">
      <p className={`text-sm ${inProgress ? "text-gray-700" : completed ? "text-gray-700" : "text-gray-500"}`}>
        {children}
      </p>
    </div>
  </div>
);

const Processing = () => {
  const [, params] = useRoute("/processing/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [processingStep, setProcessingStep] = useState(2);
  
  useEffect(() => {
    const fetchRequest = async () => {
      if (!params?.id) return;
      
      try {
        const requestId = parseInt(params.id, 10);
        const response = await fetch(`/api/emergency-requests/${requestId}`, {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch emergency request");
        }
        
        const data = await response.json();
        setRequest(data);
        setLoading(false);
        
        // Simulate processing steps
        const timer1 = setTimeout(() => {
          setProcessingStep(3);
        }, 2000);
        
        const timer2 = setTimeout(() => {
          setProcessingStep(4);
        }, 4000);
        
        const timer3 = setTimeout(() => {
          // Update status to "processed"
          updateRequestStatus(requestId, "processed");
        }, 5000);
        
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
        };
      } catch (err) {
        console.error("Error fetching request:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setLoading(false);
      }
    };
    
    fetchRequest();
  }, [params?.id]);
  
  const updateRequestStatus = async (id: number, status: string) => {
    try {
      await apiRequest("PATCH", `/api/emergency-requests/${id}/status`, { status });
      setLocation(`/response/${id}`);
    } catch (err) {
      console.error("Error updating request status:", err);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancel = async () => {
    if (!request) return;
    
    try {
      await apiRequest("PATCH", `/api/emergency-requests/${request.id}/status`, { status: "cancelled" });
      toast({
        title: "Request cancelled",
        description: "Your emergency request has been cancelled.",
      });
      setLocation("/");
    } catch (err) {
      console.error("Error cancelling request:", err);
      toast({
        title: "Error",
        description: "Failed to cancel your request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return <LoadingState message="Loading your request..." />;
  }
  
  if (error || !request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Request</h2>
        <p className="text-gray-600 mb-6">{error || "Request not found"}</p>
        <Button onClick={() => setLocation("/")} className="bg-secondary-500 hover:bg-secondary-600">
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Processing Your Request - SkyBridge</title>
        <meta name="description" content="Your emergency request is being processed. We're connecting to satellite services to provide you with the best assistance." />
      </Helmet>
    
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="animate-pulse mb-8">
            <div className="h-20 w-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
              <Satellite className="text-secondary-500 h-10 w-10" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Your Request</h2>
          <p className="text-gray-600 mb-8">We're connecting to satellite services and finding the best assistance for you.</p>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-secondary-500 h-2.5 rounded-full animate-[pulse_2s_ease-in-out_infinite]" 
              style={{ width: `${(processingStep / 4) * 100}%` }}
            ></div>
          </div>
          
          <div id="processingSteps" className="text-left max-w-md mx-auto">
            <ProcessingStep completed={true} inProgress={false}>
              Location validated
            </ProcessingStep>
            
            <ProcessingStep completed={true} inProgress={false}>
              Emergency type confirmed
            </ProcessingStep>
            
            <ProcessingStep completed={processingStep > 2} inProgress={processingStep === 2}>
              Finding available medical resources...
            </ProcessingStep>
            
            <ProcessingStep completed={processingStep > 3} inProgress={processingStep === 3}>
              Establishing connection
            </ProcessingStep>
          </div>
          
          <Button 
            onClick={handleCancel}
            variant="ghost" 
            className="mt-8 bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancel Request
          </Button>
        </div>
      </div>
    </>
  );
};

export default Processing;
