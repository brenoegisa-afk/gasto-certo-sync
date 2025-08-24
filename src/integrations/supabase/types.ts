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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      cartoes: {
        Row: {
          ativo: boolean
          bandeira: string
          created_at: string
          dia_fechamento: number
          dia_vencimento: number
          fechamento_offset: number | null
          id: string
          limite: number
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          bandeira: string
          created_at?: string
          dia_fechamento: number
          dia_vencimento: number
          fechamento_offset?: number | null
          id?: string
          limite: number
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          bandeira?: string
          created_at?: string
          dia_fechamento?: number
          dia_vencimento?: number
          fechamento_offset?: number | null
          id?: string
          limite?: number
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categorias: {
        Row: {
          cor: string | null
          created_at: string
          icone: string | null
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["category_type"]
          user_id: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          nome: string
          tipo: Database["public"]["Enums"]["category_type"]
          user_id: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["category_type"]
          user_id?: string
        }
        Relationships: []
      }
      contas: {
        Row: {
          compartilhada: boolean
          created_at: string
          id: string
          limite: number | null
          moeda: string
          nome: string
          saldo_atual: number
          saldo_inicial: number
          tipo: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          compartilhada?: boolean
          created_at?: string
          id?: string
          limite?: number | null
          moeda?: string
          nome: string
          saldo_atual?: number
          saldo_inicial?: number
          tipo?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          compartilhada?: boolean
          created_at?: string
          id?: string
          limite?: number | null
          moeda?: string
          nome?: string
          saldo_atual?: number
          saldo_inicial?: number
          tipo?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contas_partilhadas: {
        Row: {
          conta_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          conta_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          conta_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contas_partilhadas_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
        ]
      }
      faturas_cartao: {
        Row: {
          cartao_id: string
          created_at: string
          data_fim: string
          data_inicio: string
          id: string
          status: string
          valor_total: number
        }
        Insert: {
          cartao_id: string
          created_at?: string
          data_fim: string
          data_inicio: string
          id?: string
          status?: string
          valor_total?: number
        }
        Update: {
          cartao_id?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          status?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cartao_cartao_id_fkey"
            columns: ["cartao_id"]
            isOneToOne: false
            referencedRelation: "cartoes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome: string | null
          telegram_id: string | null
          telegram_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome?: string | null
          telegram_id?: string | null
          telegram_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string | null
          telegram_id?: string | null
          telegram_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      telegram_config: {
        Row: {
          ativo: boolean
          bot_username: string | null
          created_at: string
          id: string
          telegram_chat_id: string | null
          telegram_token: string
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          ativo?: boolean
          bot_username?: string | null
          created_at?: string
          id?: string
          telegram_chat_id?: string | null
          telegram_token: string
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          ativo?: boolean
          bot_username?: string | null
          created_at?: string
          id?: string
          telegram_chat_id?: string | null
          telegram_token?: string
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          cartao_id: string | null
          categoria_id: string | null
          conta_destino_id: string | null
          conta_id: string | null
          data_registro: string
          data_transacao: string
          descricao: string
          id: string
          metadata: Json | null
          parcela_num: number | null
          parcelas_total: number | null
          referencia_parcela_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          tipo: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          valor: number
        }
        Insert: {
          cartao_id?: string | null
          categoria_id?: string | null
          conta_destino_id?: string | null
          conta_id?: string | null
          data_registro?: string
          data_transacao?: string
          descricao: string
          id?: string
          metadata?: Json | null
          parcela_num?: number | null
          parcelas_total?: number | null
          referencia_parcela_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          tipo: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          valor: number
        }
        Update: {
          cartao_id?: string | null
          categoria_id?: string | null
          conta_destino_id?: string | null
          conta_id?: string | null
          data_registro?: string
          data_transacao?: string
          descricao?: string
          id?: string
          metadata?: Json | null
          parcela_num?: number | null
          parcelas_total?: number | null
          referencia_parcela_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          tipo?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_cartao_id_fkey"
            columns: ["cartao_id"]
            isOneToOne: false
            referencedRelation: "cartoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_conta_destino_id_fkey"
            columns: ["conta_destino_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          data: string
          from_conta: string
          id: string
          to_conta: string
          transacao_entrada_id: string
          transacao_saida_id: string
          user_id: string
          valor: number
        }
        Insert: {
          data?: string
          from_conta: string
          id?: string
          to_conta: string
          transacao_entrada_id: string
          transacao_saida_id: string
          user_id: string
          valor: number
        }
        Update: {
          data?: string
          from_conta?: string
          id?: string
          to_conta?: string
          transacao_entrada_id?: string
          transacao_saida_id?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_conta_fkey"
            columns: ["from_conta"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_conta_fkey"
            columns: ["to_conta"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_transacao_entrada_id_fkey"
            columns: ["transacao_entrada_id"]
            isOneToOne: false
            referencedRelation: "transacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_transacao_saida_id_fkey"
            columns: ["transacao_saida_id"]
            isOneToOne: false
            referencedRelation: "transacoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_categories: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      execute_transfer: {
        Args: {
          p_descricao: string
          p_from_conta: string
          p_to_conta: string
          p_user_id: string
          p_valor: number
        }
        Returns: string
      }
    }
    Enums: {
      account_type: "corrente" | "poupanca" | "carteira" | "externa"
      card_status: "ativo" | "inativo"
      category_type: "despesa" | "receita"
      transaction_status: "pendente" | "confirmado"
      transaction_type: "despesa" | "receita" | "transferencia"
      user_role: "owner" | "editor" | "viewer"
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
      account_type: ["corrente", "poupanca", "carteira", "externa"],
      card_status: ["ativo", "inativo"],
      category_type: ["despesa", "receita"],
      transaction_status: ["pendente", "confirmado"],
      transaction_type: ["despesa", "receita", "transferencia"],
      user_role: ["owner", "editor", "viewer"],
    },
  },
} as const
