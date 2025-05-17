import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useLocation as useUserLocation } from "@/lib/hooks/use-location";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
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


const mapContainerStyle = { width: "100%", height: "300px" };
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;


// Form schema will vary based on emergency type
const createFormSchema = (emergencyType: number) => {
  const baseSchema = z.object({
    emergencyType: z.number(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    locationDescription: z.string().optional(),
  });

  // Add specific fields based on emergency type
  switch (emergencyType) {
    case 1: // Medical Consultation
      return baseSchema.extend({
        symptoms: z.string().min(5, "Please describe your symptoms"),
        duration: z.string().min(1, "Please select duration"),
        severity: z.number().min(1).max(10),
        conditions: z.object({
          fever: z.boolean().optional(),
          breathing: z.boolean().optional(),
          pain: z.boolean().optional(),
          dizziness: z.boolean().optional(),
        }),
      });
    case 2: // Location-Based Finder
      return baseSchema.extend({
        medicalNeed: z.string().min(5, "Please describe what you're looking for"),
        urgency: z.string().min(1, "Please select urgency level"),
        travelMode: z.string().min(1, "Please select how you're traveling"),
      });
    case 3: // Medicine Delivery
      return baseSchema.extend({
        medications: z.string().min(5, "Please list the medications you need"),
        prescription: z.boolean(),
        medicalCondition: z.string().optional(),
      });
    case 4: // Emergency Personnel
      return baseSchema.extend({
        emergencyDescription: z.string().min(10, "Please describe the emergency situation"),
        numberOfPeople: z.string().min(1, "Please indicate how many people need help"),
        hazards: z.string().optional(),
      });
    case 5: // Helicopter Evacuation
      return baseSchema.extend({
        emergencyDescription: z.string().min(10, "Please describe the emergency in detail"),
        numberOfPeople: z.string().min(1, "Please indicate how many people need evacuation"),
        terrainDescription: z.string().min(5, "Please describe the terrain"),
        landingZone: z.string().optional(),
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
  const [severityValue, setSeverityValue] = useState(5);
    const [communicationMethod, setCommunicationMethod] = useState<string | null>(null);
    const {
        location: userLocation,
        error: locationError,
        loading: locationLoading,
        getLocation: fetchLocation
    } = useUserLocation();

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
        {emergencyType.id !== 1 ? (
            // SHOW LOCATION ONLY IF NOT TYPE 1
            <Card className="mb-8">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Your Location</h3>
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700">
            {userLocation
                ? userLocation.address ||
                `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
                : "Detecting your location..."}
          </span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {userLocation
                ? `Accuracy: ${Math.round(userLocation.accuracy)}m`
                : "Accuracy: Pending"}
          </span>
                        </div>
                        {userLocation ? (
                            <LoadScript googleMapsApiKey={apiKey}>
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={{
                                        lat: userLocation.latitude,
                                        lng: userLocation.longitude,
                                    }}
                                    zoom={15}
                                >
                                    <Marker
                                        position={{
                                            lat: userLocation.latitude,
                                            lng: userLocation.longitude,
                                        }}
                                    />
                                </GoogleMap>
                            </LoadScript>
                        ) : (
                            <div className="flex items-center justify-center h-48 bg-gray-200 rounded-lg">
                                <p className="text-gray-600">Loading map…</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        ) : (
            // SHOW COMMUNICATION METHOD ONLY FOR TYPE 1
            <Card className="mb-8">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Preferred Communication Method</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        {["Text/Chat", "Audio", "Video"].map((method) => (
                            <Button
                                key={method}
                                variant={communicationMethod === method ? "default" : "outline"}
                                className="fle x-1"
                                onClick={() => setCommunicationMethod(method)}
                            >
                                {method}
                            </Button>
                        ))}
                    </div>
                    {communicationMethod && (
                        <p className="mt-3 text-sm text-gray-600">
                            You selected <strong>{communicationMethod}</strong> consultation.
                        </p>
                    )}
                </CardContent>
            </Card>
        )}

      {/* Emergency Form */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Describe Your Situation</h3>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {getFormFields()}
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 font-semibold">
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
