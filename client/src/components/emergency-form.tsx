import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useLocation as useUserLocation } from "@/lib/hooks/use-location";
import { EmergencyType, getEmergencyTypeById } from "@/lib/emergency-types";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Form schema will vary based on emergency type
// Extend z.infer to include all possible form fields
// This allows the form to handle all fields without TypeScript errors
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
            message: "Please select how you're traveling",
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
      });
    case 4: // Emergency Personnel
      return baseSchema.superRefine((data, ctx) => {
        if (!data.emergencyDescription || data.emergencyDescription.length < 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please describe the emergency situation",
            path: ["emergencyDescription"]
          });
        }
        if (!data.numberOfPeople) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please indicate how many people need help",
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
      // Default values specific to type - only applies to applicable types
      ...(emergencyType.id === 1 && { 
        symptoms: "",
        duration: "",
        severity: 5,
        conditions: {
          fever: false,
          breathing: false,
          pain: false,
          dizziness: false,
        }
      }),
      ...(emergencyType.id === 2 && {
        medicalNeed: "",
        urgency: "medium",
        travelMode: "walking",
      }),
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await apiRequest("POST", "/api/emergency-requests", data);
      const responseData = await response.json();
      
      toast({
        title: "Request submitted",
        description: "Processing your emergency request...",
      });
      
      // Redirect to processing page
      setLocation(`/processing/${responseData.id}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFormFields = () => {
    switch (emergencyType.id) {
      case 1: // Medical Consultation
        return (
          <>
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What symptoms are you experiencing?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your symptoms in detail..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How long have you had these symptoms?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hours">A few hours</SelectItem>
                      <SelectItem value="day">About a day</SelectItem>
                      <SelectItem value="days">2-3 days</SelectItem>
                      <SelectItem value="week">About a week</SelectItem>
                      <SelectItem value="weeks">More than a week</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate the severity (1-10)</FormLabel>
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => {
                          field.onChange(value[0]);
                          setSeverityValue(value[0]);
                        }}
                      />
                    </FormControl>
                    <span className="text-sm font-medium text-gray-700 w-8 text-center">
                      {severityValue}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Do you have any of these conditions?</FormLabel>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <FormField
                  control={form.control}
                  name="conditions.fever"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <label className="text-sm text-gray-700">Fever</label>
                    </div>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="conditions.breathing"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <label className="text-sm text-gray-700">Difficulty breathing</label>
                    </div>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="conditions.pain"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <label className="text-sm text-gray-700">Severe pain</label>
                    </div>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="conditions.dizziness"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <label className="text-sm text-gray-700">Dizziness</label>
                    </div>
                  )}
                />
              </div>
            </FormItem>
          </>
        );
        
      case 2: // Location-Based Finder
        return (
          <>
            <FormField
              control={form.control}
              name="medicalNeed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What type of medical facility are you looking for?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="E.g., hospital, pharmacy, urgent care clinic..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How urgent is your need?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low - Within 24 hours</SelectItem>
                      <SelectItem value="medium">Medium - Within a few hours</SelectItem>
                      <SelectItem value="high">High - As soon as possible</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="travelMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How are you traveling?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select travel mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="walking">Walking</SelectItem>
                      <SelectItem value="public">Public Transportation</SelectItem>
                      <SelectItem value="car">Car/Taxi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case 3: // Medicine Delivery
        return (
          <>
            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What medications do you need?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List medications with dosage if known..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="prescription"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I have a prescription for these medications</FormLabel>
                    <FormDescription>
                      Prescription medications require valid documentation
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="medicalCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical condition (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your medical condition..." 
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    This helps us prioritize your delivery
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case 4: // Emergency Personnel
        return (
          <>
            <FormField
              control={form.control}
              name="emergencyDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe the emergency situation</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide detailed information about the emergency..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="numberOfPeople"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many people need assistance?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of people" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 person</SelectItem>
                      <SelectItem value="2-3">2-3 people</SelectItem>
                      <SelectItem value="4-10">4-10 people</SelectItem>
                      <SelectItem value="10+">More than 10 people</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hazards"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Are there any hazards personnel should be aware of? (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="E.g., unstable structures, fires, floods..." 
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case 5: // Helicopter Evacuation
        return (
          <>
            <FormField
              control={form.control}
              name="emergencyDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe the emergency situation in detail</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide detailed information about the emergency..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="numberOfPeople"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many people need evacuation?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of people" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 person</SelectItem>
                      <SelectItem value="2-3">2-3 people</SelectItem>
                      <SelectItem value="4-6">4-6 people</SelectItem>
                      <SelectItem value="7+">More than 7 people</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="terrainDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe the terrain</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="E.g., mountainous, forested, open field..." 
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="landingZone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potential landing zone information (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe any suitable landing areas nearby..." 
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            
            {!userLocation && (
              <div className="mt-3 bg-gray-50 p-3 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. 40.7128" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. -74.0060" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="locationDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Description</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Near Central Park, New York" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
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
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {getFormFields()}
              
              <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 font-semibold">
                Request Medical Assistance
              </Button>
            </form>
          </Form>
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
