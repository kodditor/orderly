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
      favourites: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          product: string | null
          user: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          product?: string | null
          user?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          product?: string | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_favourites_product_fkey"
            columns: ["product"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_favourites_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "user_metadata"
            referencedColumns: ["id"]
          }
        ]
      }
      locations: {
        Row: {
          buildingNum: string
          city: string
          country: string
          created_at: string | null
          id: string
          region: string
          streetAddress: string
          updated_at: string
        }
        Insert: {
          buildingNum?: string
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          region?: string
          streetAddress?: string
          updated_at?: string
        }
        Update: {
          buildingNum?: string
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          region?: string
          streetAddress?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_products: {
        Row: {
          created_at: string
          id: string
          order: number | null
          price: number
          product: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order?: number | null
          price: number
          product: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order?: number | null
          price?: number
          product?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_products_order_fkey"
            columns: ["order"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_products_product_fkey"
            columns: ["product"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: number
          isActive: boolean
          location: string | null
          shop_id: string | null
          shopper: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          isActive?: boolean
          location?: string | null
          shop_id?: string | null
          shopper?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          isActive?: boolean
          location?: string | null
          shop_id?: string | null
          shopper?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_orders_location_fkey"
            columns: ["location"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_orders_shopper_fkey"
            columns: ["shopper"]
            isOneToOne: false
            referencedRelation: "user_metadata"
            referencedColumns: ["id"]
          }
        ]
      }
      plans: {
        Row: {
          created_at: string
          features: string[]
          fillText: string | null
          id: number
          is_paid_annually: boolean
          name: string | null
          paystack_id: string | null
          price: number | null
          recommended: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          features: string[]
          fillText?: string | null
          id?: number
          is_paid_annually?: boolean
          name?: string | null
          paystack_id?: string | null
          price?: number | null
          recommended?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          features?: string[]
          fillText?: string | null
          id?: number
          is_paid_annually?: boolean
          name?: string | null
          paystack_id?: string | null
          price?: number | null
          recommended?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          imageURL: string | null
          name: string | null
          price: number | null
          shop_id: string | null
          tags: string[] | null
          updated_at: string | null
          variations: string[] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          imageURL?: string | null
          name?: string | null
          price?: number | null
          shop_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          variations?: string[] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          imageURL?: string | null
          name?: string | null
          price?: number | null
          shop_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          variations?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
      reports: {
        Row: {
          category: string | null
          created_at: string
          deleted_at: string | null
          id: number
          reason: string | null
          resolved_at: string | null
          shop: string | null
          updated_at: string | null
          user: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: number
          reason?: string | null
          resolved_at?: string | null
          shop?: string | null
          updated_at?: string | null
          user?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: number
          reason?: string | null
          resolved_at?: string | null
          shop?: string | null
          updated_at?: string | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_reports_shop_fkey"
            columns: ["shop"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_reports_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "user_metadata"
            referencedColumns: ["id"]
          }
        ]
      }
      shops: {
        Row: {
          createdAt: string
          description: string | null
          id: string
          imageURL: string | null
          location: string | null
          name: string
          optionalEmail: string | null
          optionalPhone: string | null
          shopNameTag: string
          tags: string[]
          updatedAt: string
          user_id: string | null
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id?: string
          imageURL?: string | null
          location?: string | null
          name?: string
          optionalEmail?: string | null
          optionalPhone?: string | null
          shopNameTag?: string
          tags?: string[]
          updatedAt?: string
          user_id?: string | null
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: string
          imageURL?: string | null
          location?: string | null
          name?: string
          optionalEmail?: string | null
          optionalPhone?: string | null
          shopNameTag?: string
          tags?: string[]
          updatedAt?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shops_location_fkey"
            columns: ["location"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_metadata: {
        Row: {
          created_at: string | null
          email: string | null
          firstName: string
          id: string
          isOrderly: boolean
          lastName: string | null
          location: string | null
          phoneNumber: string | null
          plan: number | null
          shop_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          firstName?: string
          id?: string
          isOrderly?: boolean
          lastName?: string | null
          location?: string | null
          phoneNumber?: string | null
          plan?: number | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          firstName?: string
          id?: string
          isOrderly?: boolean
          lastName?: string | null
          location?: string | null
          phoneNumber?: string | null
          plan?: number | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_metadata_location_fkey"
            columns: ["location"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_metadata_plan_fkey"
            columns: ["plan"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_metadata_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status:
        | "SENT"
        | "CONFIRMED"
        | "ON_DELIVERY"
        | "FULFILLED"
        | "CLOSED"
        | "DISPUTED"
        | "RETURNED"
        | "DECLINED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
