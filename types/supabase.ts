import { IOrderProducts } from "@/models/OrderProducts.model"
import { IShopperDetails } from "@/models/orderShopper.model"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          created_at: string
          id: number
          product_ids: IOrderProducts[] | null
          shop_id: string | null
          shopper: IShopperDetails | null
          shopper_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          product_ids: IOrderProducts[] | null
          shop_id: string | null
          shopper: IShopperDetails | null
          shopper_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          product_ids: IOrderProducts[] | null
          shop_id: string | null
          shopper: IShopperDetails | null
          shopper_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total?: number | null
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
            foreignKeyName: "orders_shopper_id_fkey"
            columns: ["shopper_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
      shops: {
        Row: {
          createdAt: string
          description: string | null
          id: string
          imageURL: string | null
          location: Json | null
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
          location?: Json | null
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
          location?: Json | null
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
            foreignKeyName: "shops_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
