
"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Building, User, Mail, Lock, Globe, Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Organization types for the dropdown
const organizationTypes = [
  { value: "event_organizer", label: "Event Organizer" },
  { value: "restaurant_cafe", label: "Restaurant or Cafe" },
  { value: "night_club", label: "Night Club" },
  { value: "hospital", label: "Hospital" },
  { value: "community_center", label: "Community Center" },
  { value: "educational", label: "Educational Institution" },
  { value: "non_profit", label: "Non-Profit Organization" },
  { value: "government", label: "Government Agency" },
];

// Event types for the dropdown
const eventTypes = [
  { value: "concert", label: "Concerts & Music" },
  { value: "festival", label: "Festivals" },
  { value: "conference", label: "Conferences" },
  { value: "workshop", label: "Workshops" },
  { value: "sports", label: "Sports Events" },
  { value: "entertainment", label: "Entertainment" },
  { value: "food", label: "Food & Drink" },
  { value: "health", label: "Health & Wellness" },
  { value: "cultural", label: "Cultural Events" },
  { value: "community", label: "Community Gatherings" },
];

// Vibe categories
const vibeCategories = [
  { id: "fun", label: "Fun" },
  { id: "relaxed", label: "Relaxed" },
  { id: "lgbtqia_friendly", label: "LGBTQIA+ Friendly" },
  { id: "family_friendly", label: "Family Friendly" },
  { id: "professional", label: "Professional" },
  { id: "creative", label: "Creative" },
  { id: "energetic", label: "Energetic" },
  { id: "quiet", label: "Quiet" },
];

// Form schema validation
const formSchema = z.object({
  orgName: z.string().min(2, { message: "Organization name is required" }),
  contactName: z.string().min(2, { message: "Contact person name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  country: z.string().min(2, { message: "Country is required" }),
  city: z.string().min(2, { message: "City is required" }),
  orgType: z.string({ required_error: "Please select an organization type" }),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  description: z.string().min(10, { message: "Please provide a brief description of your services" }),
  areasOfOperation: z.string().min(2, { message: "Please specify your areas of operation" }),
  eventTypes: z.string().min(1, { message: "Please select at least one event type" }),
  vibeCategories: z.array(z.string()).min(1, { message: "Please select at least one vibe category" }),
  sosParticipation: z.enum(["yes", "no"], {
    required_error: "Please indicate if you wish to participate in SOS",
  }),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const OrganizationRegisterForm = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orgName: "",
      contactName: "",
      email: "",
      password: "",
      country: "",
      city: "",
      orgType: "",
      website: "",
      description: "",
      areasOfOperation: "",
      eventTypes: "",
      vibeCategories: [],
      sosParticipation: "no",
      terms: false,
    },
  });

  const onSubmit = (data: FormValues) => {
    // This would connect to authentication service in production
    console.log("Organization registration data:", data);
    
    toast({
      title: "Registration Successful",
      description: "Your organization has been registered with HyperApp!",
    });
    
    // Navigate to org dashboard
    navigate("/");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <h3 className="text-xl font-semibold text-white mb-2">Basic Information</h3>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Organization Logo */}
            <div className="flex flex-col items-center justify-center bg-white/10 rounded-lg p-4 md:w-1/3">
              <div className="w-32 h-32 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center mb-2 overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <Building className="h-12 w-12 text-white/40" />
                )}
              </div>
              <label className="w-full">
                <span className="sr-only">Choose logo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-white bg-white/10 border-white/20 hover:bg-white/20"
                >
                  Upload Logo
                </Button>
              </label>
            </div>

            <div className="md:w-2/3 space-y-4">
              {/* Organization Name */}
              <FormField
                control={form.control}
                name="orgName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Organization Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-5 w-5 text-white/60" />
                        <Input
                          placeholder="Organization Name"
                          className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-white/40 focus-visible:ring-blue-400"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              {/* Contact Person */}
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Contact Person</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-white/60" />
                        <Input
                          placeholder="Contact Person's Name"
                          className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-white/40 focus-visible:ring-blue-400"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-white/60" />
                    <Input
                      placeholder="organization@email.com"
                      className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-white/40 focus-visible:ring-blue-400"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-white/60" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-white/40 focus-visible:ring-blue-400"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          {/* Country & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Country</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Country"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-blue-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">City</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="City"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-blue-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
          </div>

          {/* Organization Type */}
          <FormField
            control={form.control}
            name="orgType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Organization Type</FormLabel>
                <FormControl>
                  <Select
                    {...field}
                    className="bg-white/10 border-white/20 text-white focus-visible:ring-blue-400"
                  >
                    <option value="" disabled>Select organization type</option>
                    {organizationTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          {/* Website (optional) */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Website or Social Media (Optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-5 w-5 text-white/60" />
                    <Input
                      placeholder="https://your-website.com"
                      className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-white/40 focus-visible:ring-blue-400"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          <h3 className="text-xl font-semibold text-white mb-2 mt-6">Service Details</h3>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Description of Services</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your organization's services..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[100px] focus-visible:ring-blue-400"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          {/* Areas of Operation */}
          <FormField
            control={form.control}
            name="areasOfOperation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Areas of Operation</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Downtown, North Side, entire city"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-blue-400"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          {/* Event Types */}
          <FormField
            control={form.control}
            name="eventTypes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Types of Events</FormLabel>
                <FormControl>
                  <Select
                    {...field}
                    className="bg-white/10 border-white/20 text-white focus-visible:ring-blue-400"
                  >
                    <option value="" disabled>Select primary event type</option>
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          {/* Vibe Categories */}
          <FormField
            control={form.control}
            name="vibeCategories"
            render={() => (
              <FormItem>
                <div className="mb-2">
                  <FormLabel className="text-white">Vibe Categories</FormLabel>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {vibeCategories.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="vibeCategories"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-2 space-y-0 rounded-md p-2 bg-white/5 hover:bg-white/10"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                }}
                                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                              />
                            </FormControl>
                            <FormLabel className="text-white text-sm font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage className="text-red-300 mt-1" />
              </FormItem>
            )}
          />

          {/* SOS Participation */}
          <FormField
            control={form.control}
            name="sosParticipation"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-white">SOS Participation</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yes" className="text-blue-500" />
                      </FormControl>
                      <FormLabel className="text-white font-normal">
                        Yes, receive SOS alerts within service radius
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="no" className="text-blue-500" />
                      </FormControl>
                      <FormLabel className="text-white font-normal">
                        No, opt out of SOS program
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          {/* Terms and Conditions */}
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-white text-sm">
                    I agree to the <a href="#" className="underline">Terms of Service</a>, <a href="#" className="underline">Privacy Policy</a>, and to receive communications from HyperApp
                  </FormLabel>
                  <FormMessage className="text-red-300" />
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-white hover:bg-blue-100 text-blue-900 p-6 text-lg font-semibold rounded-xl"
        >
          Register Organization
        </Button>
      </form>
    </Form>
  );
};

export default OrganizationRegisterForm;
