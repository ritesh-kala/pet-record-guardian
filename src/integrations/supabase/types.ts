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
      attachments: {
        Row: {
          created_at: string | null
          description: string | null
          file_url: string
          id: string
          record_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_url: string
          id?: string
          record_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_url?: string
          id?: string
          record_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          additional_notes: string | null
          created_at: string | null
          diagnosis: string | null
          id: string
          next_appointment: string | null
          pet_id: string | null
          prescriptions: string[] | null
          reason_for_visit: string | null
          treatment: string | null
          updated_at: string | null
          vaccinations_given: string[] | null
          veterinarian: string | null
          visit_date: string
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          next_appointment?: string | null
          pet_id?: string | null
          prescriptions?: string[] | null
          reason_for_visit?: string | null
          treatment?: string | null
          updated_at?: string | null
          vaccinations_given?: string[] | null
          veterinarian?: string | null
          visit_date: string
        }
        Update: {
          additional_notes?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          next_appointment?: string | null
          pet_id?: string | null
          prescriptions?: string[] | null
          reason_for_visit?: string | null
          treatment?: string | null
          updated_at?: string | null
          vaccinations_given?: string[] | null
          veterinarian?: string | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          name: string
          phone: string | null
          preferred_vet_contact: string | null
          preferred_vet_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          name: string
          phone?: string | null
          preferred_vet_contact?: string | null
          preferred_vet_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          name?: string
          phone?: string | null
          preferred_vet_contact?: string | null
          preferred_vet_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pets: {
        Row: {
          age: number | null
          breed: string | null
          created_at: string | null
          date_of_birth: string | null
          gender: string | null
          id: string
          insurance_provider: string | null
          microchip_id: string | null
          name: string
          notes: string | null
          owner_id: string | null
          policy_number: string | null
          species: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          breed?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          insurance_provider?: string | null
          microchip_id?: string | null
          name: string
          notes?: string | null
          owner_id?: string | null
          policy_number?: string | null
          species: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          breed?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          insurance_provider?: string | null
          microchip_id?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          policy_number?: string | null
          species?: string
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
