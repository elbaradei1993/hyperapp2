
"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Mail, Lock } from "lucide-react";

// Form schema validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // This would connect to authentication service in production
    console.log("Login data:", data);
    
    toast({
      title: "Login Successful",
      description: "Welcome back to HyperApp!",
    });
    
    // Navigate to home page
    navigate("/");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-white/60" />
                    <Input
                      placeholder="your@email.com"
                      className="bg-white/10 border-white/20 text-white pl-10 placeholder:text-white/40 focus-visible:ring-blue-400"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

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
        </div>

        <div className="flex justify-end">
          <Button 
            variant="link" 
            className="text-blue-100 hover:text-white p-0"
            type="button"
          >
            Forgot password?
          </Button>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-white hover:bg-blue-100 text-blue-900 p-6 text-lg font-semibold rounded-xl"
        >
          Sign In
        </Button>

        <p className="text-center text-sm text-blue-100 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </Form>
  );
};

export default LoginForm;
