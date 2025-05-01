
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

interface RequestBody {
  row_id: number;
  table_name: string;
  column_name: string;
  increment_amount: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const { row_id, table_name, column_name, increment_amount } = await req.json() as RequestBody;

    // Validate inputs to prevent SQL injection
    const validTables = ["vibe_reports", "profiles"];
    const validColumns = ["confirmed_count", "points", "reputation"];
    
    if (!validTables.includes(table_name) || !validColumns.includes(column_name)) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid table or column name" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Use parameterized query to safely increment value
    const { data, error } = await supabaseClient.rpc(
      'increment_column_value',
      { 
        p_table_name: table_name, 
        p_column_name: column_name, 
        p_row_id: row_id, 
        p_increment: increment_amount 
      }
    );

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
