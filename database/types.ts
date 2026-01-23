export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bar: {
        Row: {
          created_at: string
          id: number
          menus: string[]
          name: string
          slug: string
          thumb_url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          menus?: string[]
          name: string
          slug: string
          thumb_url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          menus?: string[]
          name?: string
          slug?: string
          thumb_url?: string | null
        }
        Relationships: []
      }
      drinks_glass: {
        Row: {
          active: boolean
          created_at: string
          id: number
          name: string
          slug: string
          thumb_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: number
          name: string
          slug: string
          thumb_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: number
          name?: string
          slug?: string
          thumb_url?: string | null
        }
        Relationships: []
      }
      menu: {
        Row: {
          active: boolean
          created_at: string
          id: number
          name: string
          slug: string
          thumb_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: number
          name: string
          slug: string
          thumb_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: number
          name?: string
          slug?: string
          thumb_url?: string | null
        }
        Relationships: []
      }
      menu_item: {
        Row: {
          active: boolean
          alcoholic: boolean | null
          category: string
          created_at: string
          glass: string | null
          id: number
          instructions: string | null
          last_modified: string | null
          measurements: string[] | null
          name: string
          price: number | null
          slug: string
          thumb_url: string
        }
        Insert: {
          active?: boolean
          alcoholic?: boolean | null
          category: string
          created_at?: string
          glass?: string | null
          id?: number
          instructions?: string | null
          last_modified?: string | null
          measurements?: string[] | null
          name: string
          price?: number | null
          slug: string
          thumb_url: string
        }
        Update: {
          active?: boolean
          alcoholic?: boolean | null
          category?: string
          created_at?: string
          glass?: string | null
          id?: number
          instructions?: string | null
          last_modified?: string | null
          measurements?: string[] | null
          name?: string
          price?: number | null
          slug?: string
          thumb_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "menu_item_category"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "menu_item_glass_fkey"
            columns: ["glass"]
            isOneToOne: false
            referencedRelation: "drinks_glass"
            referencedColumns: ["name"]
          },
        ]
      }
      menu_item_category: {
        Row: {
          active: boolean
          created_at: string
          id: number
          menu: string
          name: string
          slug: string
          thumb_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: number
          menu: string
          name: string
          slug: string
          thumb_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: number
          menu?: string
          name?: string
          slug?: string
          thumb_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_category_menu_fkey"
            columns: ["menu"]
            isOneToOne: false
            referencedRelation: "menu"
            referencedColumns: ["name"]
          },
        ]
      }
      menu_item_ingredient: {
        Row: {
          active: boolean
          created_at: string
          id: number
          name: string
          slug: string
          thumb_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: number
          name: string
          slug: string
          thumb_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: number
          name?: string
          slug?: string
          thumb_url?: string | null
        }
        Relationships: []
      }
      profile: {
        Row: {
          active: boolean
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          mode: string
          password: string
          pin: string
          roles: Database["public"]["Enums"]["user_role"][]
          username: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          mode?: string
          password: string
          pin: string
          roles?: Database["public"]["Enums"]["user_role"][]
          username: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          mode?: string
          password?: string
          pin?: string
          roles?: Database["public"]["Enums"]["user_role"][]
          username?: string
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
      user_role: "admin" | "bar-manager" | "bar-staff"
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
      user_role: ["admin", "bar-manager", "bar-staff"],
    },
  },
} as const
