import React from "react";
import { UberNavbar } from "@/components/layout/UberNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, AlertTriangle, Users, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

export const Terms = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <UberNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/account">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2" size={16} />
              Back to Account
            </Button>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-lg">
            Please read these terms carefully before using HyperAPP
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield size={20} />
                <span>HyperAPP Terms of Use</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-muted-foreground">
                By using HyperAPP, you agree to these terms and conditions. 
                HyperAPP is designed to enhance community safety and awareness 
                through responsible information sharing.
              </p>
            </CardContent>
          </Card>

          {/* Platform Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users size={20} />
                <span>Platform Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    HyperAPP is a public, user-powered platform designed for community safety and awareness.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    Do not use HyperAPP to spread false, misleading, or dangerous information.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    Reports should be factual, helpful, and relevant to community safety.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    Respect others' privacy and do not share personal or sensitive information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle size={20} />
                <span>Emergency Alerts & SOS</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-800 dark:text-red-200 font-medium mb-2">
                  Important Notice
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  SOS alerts are informational tools and are NOT a substitute for calling emergency services (911, 112, etc.). 
                  In case of a real emergency, always contact official emergency services immediately.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    Use SOS alerts responsibly and only for genuine safety concerns.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    False emergency reports may result in immediate account suspension.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    HyperAPP is not responsible for emergency response or rescue services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin size={20} />
                <span>Privacy & Location Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    All location data is approximate and used only for community awareness purposes.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    We never use location data for tracking users outside the app's intended functionality.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    Users can choose to report anonymously to protect their identity.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    Location sharing is optional and can be disabled in your account settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>Account Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    You are responsible for maintaining the security of your account credentials.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    Do not impersonate others or create fake accounts.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    Respect community guidelines and other users' safety and privacy.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    Report inappropriate content or behavior through proper channels.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enforcement */}
          <Card>
            <CardHeader>
              <CardTitle>Terms Enforcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  We reserve the right to suspend or terminate accounts for violations of these terms, 
                  including but not limited to: spam, abuse, impersonation, false reporting, or any 
                  behavior that compromises community safety.
                </p>
              </div>
              
              <p className="text-muted-foreground">
                These terms may be updated periodically. Continued use of HyperAPP constitutes 
                acceptance of any changes to these terms.
              </p>
              
              <p className="text-muted-foreground text-sm">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile spacing */}
      {isMobile && <div className="h-16" />}
    </div>
  );
};

export default Terms;