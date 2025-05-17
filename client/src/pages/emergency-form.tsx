import { useEffect } from "react";
import { useRoute } from "wouter";
import { useLocation } from "@/lib/hooks/use-location";
import { getEmergencyTypeById } from "@/lib/emergency-types";
import EmergencyFormComponent from "@/components/emergency-form";
import LoadingState from "@/components/loading-state";
import NotFound from "@/pages/not-found";
import { Helmet } from "react-helmet";

const EmergencyForm = () => {
  const [, params] = useRoute("/emergency-form/:type");
  const { getLocation } = useLocation();
  
  useEffect(() => {
    // Try to get location when the page loads
    getLocation();
  }, [getLocation]);

  if (!params) {
    return <NotFound />;
  }

  const emergencyTypeId = parseInt(params.type, 10);
  const emergencyType = getEmergencyTypeById(emergencyTypeId);

  if (!emergencyType) {
    return <NotFound />;
  }

  return (
    <>
      <Helmet>
        <title>{emergencyType.title} - SkyBridge</title>
        <meta name="description" content={`Request ${emergencyType.title.toLowerCase()} assistance through SkyBridge's satellite emergency service. ${emergencyType.description}`} />
      </Helmet>
      
      <EmergencyFormComponent emergencyType={emergencyType} />
    </>
  );
};

export default EmergencyForm;
