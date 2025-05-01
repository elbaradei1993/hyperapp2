export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
