export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      communities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["community_role"]
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["community_role"]
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["community_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      event_communities: {
        Row: {
          community_id: string
          event_id: number
          id: string
        }
        Insert: {
          community_id: string
          event_id: number
          id?: string
        }
        Update: {
          community_id?: string
          event_id?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_communities_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_communities_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          end_date_time: string
          id: number
          is_featured: boolean
          is_paid: boolean
          latitude: string
          longitude: string
          max_attendees: number | null
          organizer_id: number
          poster_url: string | null
          price: number | null
          start_date_time: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          title: string
          vibe_type_id: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          end_date_time: string
          id?: number
          is_featured?: boolean
          is_paid?: boolean
          latitude: string
          longitude: string
          max_attendees?: number | null
          organizer_id: number
          poster_url?: string | null
          price?: number | null
          start_date_time: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          title: string
          vibe_type_id?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          end_date_time?: string
          id?: number
          is_featured?: boolean
          is_paid?: boolean
          latitude?: string
          longitude?: string
          max_attendees?: number | null
          organizer_id?: number
          poster_url?: string | null
          price?: number | null
          start_date_time?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          title?: string
          vibe_type_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_vibe_type_id_fkey"
            columns: ["vibe_type_id"]
            isOneToOne: false
            referencedRelation: "vibe_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birthdate: string | null
          email: string | null
          gender: string | null
          id: string
          location: string | null
          name: string | null
          phone_number: string | null
          points: number | null
          profile_picture: string | null
          reputation: number | null
          settings: Json | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          birthdate?: string | null
          email?: string | null
          gender?: string | null
          id: string
          location?: string | null
          name?: string | null
          phone_number?: string | null
          points?: number | null
          profile_picture?: string | null
          reputation?: number | null
          settings?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          birthdate?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          location?: string | null
          name?: string | null
          phone_number?: string | null
          points?: number | null
          profile_picture?: string | null
          reputation?: number | null
          settings?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      profiles_search_history: {
        Row: {
          created_at: string | null
          id: string
          query: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          query: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          query?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sos_alerts: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean
          latitude: string
          longitude: string
          resolved_at: string | null
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          latitude: string
          longitude: string
          resolved_at?: string | null
          status?: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          latitude?: string
          longitude?: string
          resolved_at?: string | null
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_mapping: {
        Row: {
          integer_id: number
          uuid_id: string
        }
        Insert: {
          integer_id: number
          uuid_id: string
        }
        Update: {
          integer_id?: number
          uuid_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          badges: Json | null
          created_at: string | null
          email: string
          id: number
          is_premium: boolean
          level: number
          name: string | null
          organization_info: Json | null
          password: string
          phone_number: string | null
          points: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_type: string
          username: string
        }
        Insert: {
          badges?: Json | null
          created_at?: string | null
          email: string
          id?: number
          is_premium?: boolean
          level?: number
          name?: string | null
          organization_info?: Json | null
          password: string
          phone_number?: string | null
          points?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_type?: string
          username: string
        }
        Update: {
          badges?: Json | null
          created_at?: string | null
          email?: string
          id?: number
          is_premium?: boolean
          level?: number
          name?: string | null
          organization_info?: Json | null
          password?: string
          phone_number?: string | null
          points?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_type?: string
          username?: string
        }
        Relationships: []
      }
      vibe_report_communities: {
        Row: {
          community_id: string
          id: string
          vibe_report_id: number
        }
        Insert: {
          community_id: string
          id?: string
          vibe_report_id: number
        }
        Update: {
          community_id?: string
          id?: string
          vibe_report_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vibe_report_communities_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibe_report_communities_vibe_report_id_fkey"
            columns: ["vibe_report_id"]
            isOneToOne: false
            referencedRelation: "vibe_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      vibe_reports: {
        Row: {
          confirmed_count: number
          created_at: string | null
          description: string | null
          id: number
          is_anonymous: boolean
          latitude: string
          longitude: string
          media_url: string | null
          title: string | null
          user_id: number | null
          vibe_type_id: number
        }
        Insert: {
          confirmed_count?: number
          created_at?: string | null
          description?: string | null
          id?: number
          is_anonymous?: boolean
          latitude: string
          longitude: string
          media_url?: string | null
          title?: string | null
          user_id?: number | null
          vibe_type_id: number
        }
        Update: {
          confirmed_count?: number
          created_at?: string | null
          description?: string | null
          id?: number
          is_anonymous?: boolean
          latitude?: string
          longitude?: string
          media_url?: string | null
          title?: string | null
          user_id?: number | null
          vibe_type_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vibe_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibe_reports_vibe_type_id_fkey"
            columns: ["vibe_type_id"]
            isOneToOne: false
            referencedRelation: "vibe_types"
            referencedColumns: ["id"]
          },
        ]
      }
      vibe_types: {
        Row: {
          color: string
          id: number
          name: string
        }
        Insert: {
          color: string
          id?: number
          name: string
        }
        Update: {
          color?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_integer_id: {
        Args: { user_uuid: string }
        Returns: number
      }
      increment_vibe_count: {
        Args: { report_id: number }
        Returns: undefined
      }
      is_community_member: {
        Args: { _user_id: string; _community_id: string }
        Returns: boolean
      }
    }
    Enums: {
      community_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      community_role: ["owner", "admin", "member"],
    },
  },
} as const
