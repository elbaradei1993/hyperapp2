
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSupabaseClient } from "../_shared/supabaseClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VibeReport {
  title: string;
  description: string | null;
  latitude: string;
  longitude: string;
  vibe_type_id: number;
  is_anonymous: boolean;
  user_id?: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabase = createSupabaseClient();
    
    // Get auth user from request
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError) {
        console.error("Auth error:", authError);
      } else if (user) {
        userId = user.id;
      }
    }
    
    // Parse request body
    const { title, description, latitude, longitude, vibe_type_id, is_anonymous } = await req.json();
    
    // Input validation
    if (!title || !latitude || !longitude || !vibe_type_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create vibe report
    const vibeReport: VibeReport = {
      title,
      description: description || null,
      latitude,
      longitude,
      vibe_type_id,
      is_anonymous: is_anonymous || false,
      user_id: is_anonymous ? null : userId
    };
    
    const { data, error } = await supabase
      .from('vibe_reports')
      .insert(vibeReport)
      .select('id')
      .single();
      
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Vibe report created successfully", 
        id: data.id 
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in report-vibe function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create vibe report" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
