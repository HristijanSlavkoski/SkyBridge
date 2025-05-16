import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useLocation as useUserLocation } from "@/lib/hooks/use-location";
import { EmergencyType, getEmergencyTypeById } from "@/lib/emergency-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Form schema will vary based on emergency type
const createFormSchema = (emergencyType: number) => {
  // Base schema with standard fields
  const baseSchema = z.object({
    emergencyType: z.number(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    locationDescription: z.string().optional(),
    // Include all possible fields for full type compatibility
    symptoms: z.string().optional(),
    duration: z.string().optional(),
    severity: z.number().optional(),
    conditions: z.object({
      fever: z.boolean().optional(),
      breathing: z.boolean().optional(),
      pain: z.boolean().optional(),
      dizziness: z.boolean().optional(),
    }).optional(),
    medicalNeed: z.string().optional(),
    urgency: z.string().optional(),
    travelMode: z.string().optional(),
    medications: z.string().optional(),
    prescription: z.boolean().optional(),
    medicalCondition: z.string().optional(),
    emergencyDescription: z.string().optional(),
    numberOfPeople: z.string().optional(),
    hazards: z.string().optional(),
    terrainDescription: z.string().optional(),
    landingZone: z.string().optional(),
  });

  // Add specific validation requirements based on emergency type
  switch (emergencyType) {
    case 1: // Medical Consultation
      return baseSchema.superRefine((data, ctx) => {
        if (!data.symptoms || data.symptoms.length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please describe your symptoms (minimum 5 characters)",
            path: ["symptoms"]
          });
        }
        if (!data.duration) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select duration",
            path: ["duration"]
          });
        }
        if (!data.severity || data.severity < 1 || data.severity > 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please rate severity (1-10)",
            path: ["severity"]
          });
        }
      });
    case 2: // Location-Based Finder
      return baseSchema.superRefine((data, ctx) => {
        if (!data.medicalNeed || data.medicalNeed.length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please describe what you're looking for",
            path: ["medicalNeed"]
          });
        }
        if (!data.urgency) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select urgency level",
            path: ["urgency"]
          });
        }
        if (!data.travelMode) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select how you're able to travel",
            path: ["travelMode"]
          });
        }
      });
    case 3: // Medicine Delivery
      return baseSchema.superRefine((data, ctx) => {
        if (!data.medications || data.medications.length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please list the medications you need",
            path: ["medications"]
          });
        }
        if (!data.urgency) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select urgency level",
            path: ["urgency"]
          });
        }
      });
    case 4: // Medical Personnel Dispatch
      return baseSchema.superRefine((data, ctx) => {
        if (!data.emergencyDescription || data.emergencyDescription.length < 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please describe the medical situation in detail",
            path: ["emergencyDescription"]
          });
        }
        if (!data.numberOfPeople) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please indicate how many people need assistance",
            path: ["numberOfPeople"]
          });
        }
      });
    case 5: // Helicopter Evacuation
      return baseSchema.superRefine((data, ctx) => {
        if (!data.emergencyDescription || data.emergencyDescription.length < 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please describe the emergency in detail",
            path: ["emergencyDescription"]
          });
        }
        if (!data.numberOfPeople) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please indicate how many people need evacuation",
            path: ["numberOfPeople"]
          });
        }
        if (!data.terrainDescription || data.terrainDescription.length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please describe the terrain",
            path: ["terrainDescription"]
          });
        }
      });
    default:
      return baseSchema;
  }
};

interface EmergencyFormProps {
  emergencyType: EmergencyType;
}

const EmergencyForm = ({ emergencyType }: EmergencyFormProps) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { location: userLocation } = useUserLocation();
  const [severityValue, setSeverityValue] = useState(5);
  
  const formSchema = createFormSchema(emergencyType.id);
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emergencyType: emergencyType.id,
      latitude: userLocation ? String(userLocation.latitude) : "",
      longitude: userLocation ? String(userLocation.longitude) : "",
      locationDescription: userLocation?.address || "",
      severity: 5,
    },
  });

  const onSubmit = async (data: FormValues) => {
    // Combine location data
    if (userLocation) {
      data.latitude = String(userLocation.latitude);
      data.longitude = String(userLocation.longitude);
      data.locationDescription = userLocation.address || "";
    }
    
    try {
      // Submit the form to the server
      const response = await apiRequest<{id: number}>("/api/emergency-requests", {
        method: "POST",
        body: JSON.stringify(data),
      });
      
      // If successful, navigate to processing page
      if (response.id) {
        setLocation(`/processing/${response.id}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Different form fields based on emergency type
  const getFormFields = () => {
    switch (emergencyType.id) {
      case 1: // Medical Consultation
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Describe your symptoms</label>
              <Textarea 
                {...form.register("symptoms")} 
                placeholder="Describe what you're experiencing..." 
                rows={3}
              />
              {form.formState.errors.symptoms && (
                <p className="text-sm text-red-500">{form.formState.errors.symptoms.message?.toString()}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">How long have you had these symptoms?</label>
              <Select 
                onValueChange={(value) => form.setValue("duration", value)}
                defaultValue={form.getValues("duration") || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">A few hours</SelectItem>
                  <SelectItem value="today">Started today</SelectItem>
                  <SelectItem value="days">A few days</SelectItem>
                  <SelectItem value="week">About a week</SelectItem>
                  <SelectItem value="longer">Longer than a week</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.duration && (
                <p className="text-sm text-red-500">{form.formState.errors.duration.message?.toString()}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Rate the severity (1-10)</label>
              <div className="flex items-center space-x-3">
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[form.getValues("severity") || 5]}
                  onValueChange={(value) => {
                    form.setValue("severity", value[0]);
                    setSeverityValue(value[0]);
                  }}
                />
                <span className="text-sm font-medium text-gray-700 w-8 text-center">
                  {severityValue}
                </span>
              </div>
              {form.formState.errors.severity && (
                <p className="text-sm text-red-500">{form.formState.errors.severity.message?.toString()}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Do you have any of these conditions?</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-start space-x-3 p-2 bg-gray-50 rounded-md">
                  <Checkbox
                    checked={form.getValues("conditions.fever") || false}
                    onCheckedChange={(checked) => form.setValue("conditions.fever", !!checked)}
                  />
                  <span className="text-sm font-medium">Fever</span>
                </div>
                <div className="flex items-start space-x-3 p-2 bg-gray-50 rounded-md">
                  <Checkbox
                    checked={form.getValues("conditions.breathing") || false}
                    onCheckedChange={(checked) => form.setValue("conditions.breathing", !!checked)}
                  />
                  <span className="text-sm font-medium">Difficulty breathing</span>
                </div>
                <div className="flex items-start space-x-3 p-2 bg-gray-50 rounded-md">
                  <Checkbox
                    checked={form.getValues("conditions.pain") || false}
                    onCheckedChange={(checked) => form.setValue("conditions.pain", !!checked)}
                  />
                  <span className="text-sm font-medium">Severe pain</span>
                </div>
                <div className="flex items-start space-x-3 p-2 bg-gray-50 rounded-md">
                  <Checkbox
                    checked={form.getValues("conditions.dizziness") || false}
                    onCheckedChange={(checked) => form.setValue("conditions.dizziness", !!checked)}
                  />
                  <span className="text-sm font-medium">Dizziness/Fainting</span>
                </div>
              </div>
            </div>
          </>
        );
        
      case 2: // Location-Based Finder
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">What medical service are you looking for?</label>
              <Textarea 
                {...form.register("medicalNeed")} 
                placeholder="E.g., pharmacy, clinic, hospital, specific medication..." 
                rows={2}
              />
              <p className="text-xs text-gray-500">
                Be as specific as possible to help us locate the right service for you
              </p>
              {form.formState.errors.medicalNeed && (
                <p className="text-sm text-red-500">{form.formState.errors.medicalNeed.message?.toString()}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">How urgent is your need?</label>
              <Select 
                onValueChange={(value) => form.setValue("urgency", value)}
                defaultValue={form.getValues("urgency") || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Need immediately (within hours)</SelectItem>
                  <SelectItem value="today">Need today</SelectItem>
                  <SelectItem value="tomorrow">Need by tomorrow</SelectItem>
                  <SelectItem value="week">Within the week</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.urgency && (
                <p className="text-sm text-red-500">{form.formState.errors.urgency.message?.toString()}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">How are you able to travel?</label>
              <Select 
                onValueChange={(value) => form.setValue("travelMode", value)}
                defaultValue={form.getValues("travelMode") || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select travel method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walking">Walking only</SelectItem>
                  <SelectItem value="publicTransit">Public transportation</SelectItem>
                  <SelectItem value="taxi">Taxi/Ride service</SelectItem>
                  <SelectItem value="driving">I can drive</SelectItem>
                  <SelectItem value="none">Unable to travel (need delivery)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                This helps us suggest locations within your mobility range
              </p>
              {form.formState.errors.travelMode && (
                <p className="text-sm text-red-500">{form.formState.errors.travelMode.message?.toString()}</p>
              )}
            </div>
          </>
        );
        
      case 3: // Medicine Delivery
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">What medications do you need?</label>
              <Textarea 
                {...form.register("medications")} 
                placeholder="List all medications you need delivered..." 
                rows={3}
              />
              {form.formState.errors.medications && (
                <p className="text-sm text-red-500">{form.formState.errors.medications.message?.toString()}</p>
              )}
            </div>
            
            <div className="flex items-start space-x-3 py-2">
              <Checkbox
                checked={form.getValues("prescription") || false}
                onCheckedChange={(checked) => form.setValue("prescription", !!checked)}
              />
              <div>
                <label className="text-sm font-medium">I have a prescription for these medications</label>
                <p className="text-xs text-gray-500">
                  You may need to provide prescription details or upload images later
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">How urgent is your need?</label>
              <Select 
                onValueChange={(value) => form.setValue("urgency", value)}
                defaultValue={form.getValues("urgency") || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Critical (within hours)</SelectItem>
                  <SelectItem value="today">Urgent (today)</SelectItem>
                  <SelectItem value="tomorrow">Soon (tomorrow)</SelectItem>
                  <SelectItem value="days">Routine (next few days)</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.urgency && (
                <p className="text-sm text-red-500">{form.formState.errors.urgency.message?.toString()}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Briefly describe your medical condition (optional)</label>
              <Textarea 
                {...form.register("medicalCondition")} 
                placeholder="This helps us prioritize your request..." 
                rows={2}
              />
            </div>
          </>
        );
        
      case 4: // Medical Personnel Dispatch
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Describe the medical situation</label>
              <Textarea 
                {...form.register("emergencyDescription")} 
                placeholder="Please provide as much detail as possible..." 
                rows={3}
              />
              {form.formState.errors.emergencyDescription && (
                <p className="text-sm text-red-500">{form.formState.errors.emergencyDescription.message?.toString()}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">How many people need assistance?</label>
              <Select 
                onValueChange={(value) => form.setValue("numberOfPeople", value)}
                defaultValue={form.getValues("numberOfPeople") || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of people" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 person</SelectItem>
                  <SelectItem value="2-3">2-3 people</SelectItem>
                  <SelectItem value="4-6">4-6 people</SelectItem>
                  <SelectItem value="7+">More than 7 people</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.numberOfPeople && (
                <p className="text-sm text-red-500">{form.formState.errors.numberOfPeople.message?.toString()}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Are there any hazards or dangers in the area? (optional)</label>
              <Textarea 
                {...form.register("hazards")} 
                placeholder="E.g., difficult terrain, dangerous wildlife, extreme weather..." 
                rows={2}
              />
            </div>
          </>
        );
        
      case 5: // Helicopter Evacuation
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Describe the emergency situation</label>
              <Textarea 
                {...form.register("emergencyDescription")} 
                placeholder="Please provide as much detail as possible..." 
                rows={3}
              />
              {form.formState.errors.emergencyDescription && (
                <p className="text-sm text-red-500">{form.formState.errors.emergencyDescription.message?.toString()}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">How many people need evacuation?</label>
              <Select 
                onValueChange={(value) => form.setValue("numberOfPeople", value)}
                defaultValue={form.getValues("numberOfPeople") || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of people" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 person</SelectItem>
                  <SelectItem value="2-3">2-3 people</SelectItem>
                  <SelectItem value="4-6">4-6 people</SelectItem>
                  <SelectItem value="7+">More than 7 people</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.numberOfPeople && (
                <p className="text-sm text-red-500">{form.formState.errors.numberOfPeople.message?.toString()}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Describe the terrain</label>
              <Textarea 
                {...form.register("terrainDescription")} 
                placeholder="E.g., mountainous, forested, open field..." 
                rows={2}
              />
              {form.formState.errors.terrainDescription && (
                <p className="text-sm text-red-500">{form.formState.errors.terrainDescription.message?.toString()}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Potential landing zone information (optional)</label>
              <Textarea 
                {...form.register("landingZone")} 
                placeholder="Describe any suitable landing areas nearby..." 
                rows={2}
              />
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="text-secondary-600 hover:text-secondary-700 p-0"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to emergency types
        </Button>
      </div>

      {/* Emergency Type Header */}
      <div className="mb-8 text-center">
        <div className="inline-block rounded-full bg-blue-100 p-3 mb-4">
          <div className={`h-12 w-12 rounded-full bg-${emergencyType.id === 1 ? 'secondary' : emergencyType.id === 2 ? 'green' : emergencyType.id === 3 ? 'yellow' : emergencyType.id === 4 ? 'orange' : 'red'}-500 flex items-center justify-center text-white`}>
            {emergencyType.icon}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{emergencyType.title}</h2>
        <p className="text-gray-600">{emergencyType.description}</p>
      </div>

      {/* Location Information */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Your Location</h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">
                {userLocation ? 
                  userLocation.address || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}` : 
                  form.getValues("latitude") ? `Manual: ${form.getValues("latitude")}, ${form.getValues("longitude")}` : 
                  "Location required for emergency services"}
              </span>
              <span className={`bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                {userLocation ? `Accuracy: ${Math.round(userLocation.accuracy)}m` : "Manual location"}
              </span>
            </div>
            
            {/* Map placeholder - would be replaced with real map */}
            <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
              <p className="text-gray-600">
                Map view showing your current location
              </p>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-ping absolute h-5 w-5 rounded-full bg-red-500 opacity-75"></div>
                <div className="relative h-3 w-3 rounded-full bg-red-600"></div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white"
              onClick={() => useUserLocation().getLocation()}
              type="button"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Update Location
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              type="button"
              onClick={() => {
                form.setValue("latitude", "");
                form.setValue("longitude", "");
                form.setValue("locationDescription", "");
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Enter Manually
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Form */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Describe Your Situation</h3>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!userLocation && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Latitude</label>
                    <Input 
                      {...form.register("latitude")} 
                      placeholder="e.g. 40.7128" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Longitude</label>
                    <Input 
                      {...form.register("longitude")} 
                      placeholder="e.g. -74.0060" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location Description</label>
                  <Input 
                    {...form.register("locationDescription")} 
                    placeholder="e.g. Near Central Park, New York" 
                  />
                </div>
              </div>
            )}
            
            {getFormFields()}
            
            <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 font-semibold">
              Request Medical Assistance
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Important Note:</h4>
        <p className="text-gray-700 text-sm">
          For life-threatening emergencies, please tap the SOS button. Response times may vary based on your location and connectivity.
        </p>
      </div>
    </div>
  );
};

export default EmergencyForm;