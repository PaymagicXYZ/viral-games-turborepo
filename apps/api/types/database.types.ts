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
          asset_uri: string | null
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
          asset_uri?: string | null
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
          asset_uri?: string | null
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
      bets: {
        Row: {
          active: boolean
          address: string
          amount: number
          created_at: string
          id: string
          position: string | null
          price: number
          userId: string
        }
        Insert: {
          active?: boolean
          address: string
          amount?: number
          created_at?: string
          id?: string
          position?: string | null
          price: number
          userId: string
        }
        Update: {
          active?: boolean
          address?: string
          amount?: number
          created_at?: string
          id?: string
          position?: string | null
          price?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "bets_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "temp_player"
            referencedColumns: ["userId"]
          },
        ]
      }
      markets: {
        Row: {
          address: string
          chainId: string
          createdAt: string
          expirationDate: string | null
          outcomeTokens: string[] | null
          title: string
        }
        Insert: {
          address: string
          chainId: string
          createdAt?: string
          expirationDate?: string | null
          outcomeTokens?: string[] | null
          title: string
        }
        Update: {
          address?: string
          chainId?: string
          createdAt?: string
          expirationDate?: string | null
          outcomeTokens?: string[] | null
          title?: string
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
          updated_at?: string | null
          userId?: string
          uuid?: string
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
