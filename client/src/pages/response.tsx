import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { EmergencyRequest } from "@shared/schema";
import { getEmergencyTypeById } from "@/lib/emergency-types";
import ResponseDetails from "@/components/response-details";
import LoadingState from "@/components/loading-state";
import NotFound from "@/pages/not-found";
import { Helmet } from "react-helmet";

const Response = () => {
  const [, params] = useRoute("/response/:id");
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  
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
      } catch (err) {
        console.error("Error fetching request:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setLoading(false);
      }
    };
    
    fetchRequest();
  }, [params?.id]);
  
  if (loading) {
    return <LoadingState message="Loading your assistance details..." />;
  }
  
  if (error || !request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Response</h2>
        <p className="text-gray-600 mb-6">{error || "Response not found"}</p>
        <Button onClick={() => setLocation("/")} className="bg-secondary-500 hover:bg-secondary-600">
          Return Home
        </Button>
      </div>
    );
  }

  const emergencyType = getEmergencyTypeById(request.emergencyType);
  
  if (!emergencyType) {
    return <NotFound />;
  }

  return (
    <>
      <Helmet>
        <title>Help is on the way - EmergencyMed Connect</title>
        <meta name="description" content={`Your ${emergencyType.title.toLowerCase()} assistance request has been processed. Follow the instructions provided to receive help.`} />
      </Helmet>
      
      <div className="mb-6 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Button
          variant="ghost"
          className="text-secondary-600 hover:text-secondary-700 p-0"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Button>
      </div>

      <ResponseDetails request={request} emergencyType={emergencyType} />
    </>
  );
};

export default Response;
