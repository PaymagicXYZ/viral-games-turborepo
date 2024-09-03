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
      activities: {
        Row: {
          asset_ticker: string
          chain: string
          chain_id: number | null
          created_at: string
          ens: string | null
          id: number
          market_address: string
          market_title: string
          market_uri: string | null
          outcome_index: number
          outcome_index_formatted: string | null
          pfp: string | null
          provider: string | null
          strategy: string
          tx_hash: string
          tx_value: string
          user_address: string
        }
        Insert: {
          asset_ticker: string
          chain: string
          chain_id?: number | null
          created_at?: string
          ens?: string | null
          id?: number
          market_address: string
          market_title: string
          market_uri?: string | null
          outcome_index: number
          outcome_index_formatted?: string | null
          pfp?: string | null
          provider?: string | null
          strategy: string
          tx_hash: string
          tx_value: string
          user_address: string
        }
        Update: {
          asset_ticker?: string
          chain?: string
          chain_id?: number | null
          created_at?: string
          ens?: string | null
          id?: number
          market_address?: string
          market_title?: string
          market_uri?: string | null
          outcome_index?: number
          outcome_index_formatted?: string | null
          pfp?: string | null
          provider?: string | null
          strategy?: string
          tx_hash?: string
          tx_value?: string
          user_address?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          createdAt: string
          creator: string
          description: string | null
          endDate: string
          id: number
          imageUrl: string | null
          isActive: boolean
          provider: Database["public"]["Enums"]["market_provider"]
          slug: string
          socialLink: string | null
          startDate: string
          title: string | null
        }
        Insert: {
          createdAt?: string
          creator?: string
          description?: string | null
          endDate: string
          id?: number
          imageUrl?: string | null
          isActive?: boolean
          provider?: Database["public"]["Enums"]["market_provider"]
          slug: string
          socialLink?: string | null
          startDate: string
          title?: string | null
        }
        Update: {
          createdAt?: string
          creator?: string
          description?: string | null
          endDate?: string
          id?: number
          imageUrl?: string | null
          isActive?: boolean
          provider?: Database["public"]["Enums"]["market_provider"]
          slug?: string
          socialLink?: string | null
          startDate?: string
          title?: string | null
        }
        Relationships: []
      }
      market_positions: {
        Row: {
          createdAt: string
          eventId: string
          id: number
          marketId: string
          position: Database["public"]["Enums"]["market_position"]
          provider: Database["public"]["Enums"]["market_provider"]
          resolved: boolean
          shares: number
          title: string | null
          userId: string
        }
        Insert: {
          createdAt?: string
          eventId: string
          id?: number
          marketId: string
          position: Database["public"]["Enums"]["market_position"]
          provider: Database["public"]["Enums"]["market_provider"]
          resolved?: boolean
          shares: number
          title?: string | null
          userId: string
        }
        Update: {
          createdAt?: string
          eventId?: string
          id?: number
          marketId?: string
          position?: Database["public"]["Enums"]["market_position"]
          provider?: Database["public"]["Enums"]["market_provider"]
          resolved?: boolean
          shares?: number
          title?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_positions_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "temp_player"
            referencedColumns: ["uuid"]
          },
        ]
      }
      markets: {
        Row: {
          createdAt: string
          description: string
          eventSlug: string | null
          id: number
          imageUrl: string | null
          title: string
        }
        Insert: {
          createdAt?: string
          description: string
          eventSlug?: string | null
          id?: number
          imageUrl?: string | null
          title: string
        }
        Update: {
          createdAt?: string
          description?: string
          eventSlug?: string | null
          id?: number
          imageUrl?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "markets_eventSlug_fkey"
            columns: ["eventSlug"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["slug"]
          },
        ]
      }
      markets_metadata: {
        Row: {
          created_at: string
          image_uri: string
          market_identifier: string
          provider: string
          title: string
        }
        Insert: {
          created_at?: string
          image_uri?: string
          market_identifier: string
          provider?: string
          title: string
        }
        Update: {
          created_at?: string
          image_uri?: string
          market_identifier?: string
          provider?: string
          title?: string
        }
        Relationships: []
      }
      markets_tags: {
        Row: {
          created_at: string
          id: number
          market_identifier_id: string
          tag_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          market_identifier_id: string
          tag_id: number
        }
        Update: {
          created_at?: string
          id?: number
          market_identifier_id?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "markets_tags_market_address_fkey"
            columns: ["market_identifier_id"]
            isOneToOne: false
            referencedRelation: "markets_metadata"
            referencedColumns: ["market_identifier"]
          },
          {
            foreignKeyName: "markets_tags_market_address_fkey"
            columns: ["market_identifier_id"]
            isOneToOne: false
            referencedRelation: "markets_with_tags"
            referencedColumns: ["address"]
          },
          {
            foreignKeyName: "markets_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      resolve_criteria: {
        Row: {
          created_at: string
          criteriaType: Database["public"]["Enums"]["criteria"]
          id: number
          marketId: number | null
          threshold: number
        }
        Insert: {
          created_at?: string
          criteriaType: Database["public"]["Enums"]["criteria"]
          id?: number
          marketId?: number | null
          threshold: number
        }
        Update: {
          created_at?: string
          criteriaType?: Database["public"]["Enums"]["criteria"]
          id?: number
          marketId?: number | null
          threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "resolve_criteria_marketId_fkey"
            columns: ["marketId"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      social_markets: {
        Row: {
          created_at: string
          id: number
          identifier: string
          last_checked_at: string | null
          postId: string | null
          provider: Database["public"]["Enums"]["market_provider"]
        }
        Insert: {
          created_at?: string
          id?: number
          identifier: string
          last_checked_at?: string | null
          postId?: string | null
          provider?: Database["public"]["Enums"]["market_provider"]
        }
        Update: {
          created_at?: string
          id?: number
          identifier?: string
          last_checked_at?: string | null
          postId?: string | null
          provider?: Database["public"]["Enums"]["market_provider"]
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: number
          index: number
          label: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: number
          index?: number
          label: string
          value: string
        }
        Update: {
          created_at?: string
          id?: number
          index?: number
          label?: string
          value?: string
        }
        Relationships: []
      }
      temp_player: {
        Row: {
          balance: number
          claimed: boolean | null
          created_at: string
          points: number
          portfolio: Json | null
          provider: string | null
          updated_at: string | null
          userId: string
          uuid: string
        }
        Insert: {
          balance: number
          claimed?: boolean | null
          created_at?: string
          points?: number
          portfolio?: Json | null
          provider?: string | null
          updated_at?: string | null
          userId: string
          uuid?: string
        }
        Update: {
          balance?: number
          claimed?: boolean | null
          created_at?: string
          points?: number
          portfolio?: Json | null
          provider?: string | null
          updated_at?: string | null
          userId?: string
          uuid?: string
        }
        Relationships: []
      }
    }
    Views: {
      markets_with_tags: {
        Row: {
          address: string | null
          created_at: string | null
          image_uri: string | null
          provider: string | null
          tags: string[] | null
          title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_event_market_criteria: {
        Args: {
          market_slug: string
          likes_count: number
          resolve_criteria_type: string
        }
        Returns: {
          market_id: number
          title: string
          description: string
          event_slug: string
        }[]
      }
    }
    Enums: {
      criteria: "likes" | "recasts"
      market_position: "0" | "1"
      market_provider: "limitless" | "polymarket" | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
