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
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          assigned_to: string | null
          completed_at: string | null
          contact_method: string | null
          contact_person: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          next_action: string | null
          opportunity_id: string | null
          outcome: string | null
          priority: string | null
          scheduled_at: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          assigned_to?: string | null
          completed_at?: string | null
          contact_method?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          next_action?: string | null
          opportunity_id?: string | null
          outcome?: string | null
          priority?: string | null
          scheduled_at?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          assigned_to?: string | null
          completed_at?: string | null
          contact_method?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          next_action?: string | null
          opportunity_id?: string | null
          outcome?: string | null
          priority?: string | null
          scheduled_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          expires_at: string | null
          id: string
          is_active: boolean
          priority: string
          published_at: string
          target_roles: string[] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: string
          published_at?: string
          target_roles?: string[] | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: string
          published_at?: string
          target_roles?: string[] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          added_at: string
          customer_id: string | null
          estimated_delivery: string | null
          id: string
          notes: string | null
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          shipped_at: string | null
          status: string
          total_price: number
          unit_price: number
        }
        Insert: {
          added_at?: string
          customer_id?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity?: number
          shipped_at?: string | null
          status?: string
          total_price: number
          unit_price: number
        }
        Update: {
          added_at?: string
          customer_id?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          shipped_at?: string | null
          status?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "cart_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      content_blocks: {
        Row: {
          block_data: Json
          block_name: string
          block_type: string
          created_at: string
          created_by: string | null
          id: string
          is_template: boolean | null
          updated_at: string
        }
        Insert: {
          block_data?: Json
          block_name: string
          block_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_template?: boolean | null
          updated_at?: string
        }
        Update: {
          block_data?: Json
          block_name?: string
          block_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_template?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      content_sections: {
        Row: {
          content_data: Json
          created_at: string
          created_by: string | null
          id: string
          is_visible: boolean | null
          page_layout_id: string | null
          position_order: number
          section_name: string
          section_type: string
          updated_at: string
        }
        Insert: {
          content_data?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_visible?: boolean | null
          page_layout_id?: string | null
          position_order?: number
          section_name: string
          section_type: string
          updated_at?: string
        }
        Update: {
          content_data?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_visible?: boolean | null
          page_layout_id?: string | null
          position_order?: number
          section_name?: string
          section_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_sections_page_layout_id_fkey"
            columns: ["page_layout_id"]
            isOneToOne: false
            referencedRelation: "page_layouts"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          customer_id: string | null
          description: string
          id: string
          processed_by: string | null
          reference_id: string | null
          status: string
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          amount: number
          customer_id?: string | null
          description: string
          id?: string
          processed_by?: string | null
          reference_id?: string | null
          status?: string
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          amount?: number
          customer_id?: string | null
          description?: string
          id?: string
          processed_by?: string | null
          reference_id?: string | null
          status?: string
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "credit_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          department: string | null
          email: string | null
          id: string
          is_primary: boolean
          line_id: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          department?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          line_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          department?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          line_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_credit_profiles: {
        Row: {
          auto_approve_orders: boolean
          available_credit: number
          created_at: string
          credit_limit: number
          credit_status: string
          customer_id: string | null
          id: string
          last_payment_date: string | null
          next_payment_due: string | null
          payment_terms_days: number
          updated_at: string
          used_credit: number
        }
        Insert: {
          auto_approve_orders?: boolean
          available_credit?: number
          created_at?: string
          credit_limit?: number
          credit_status?: string
          customer_id?: string | null
          id?: string
          last_payment_date?: string | null
          next_payment_due?: string | null
          payment_terms_days?: number
          updated_at?: string
          used_credit?: number
        }
        Update: {
          auto_approve_orders?: boolean
          available_credit?: number
          created_at?: string
          credit_limit?: number
          credit_status?: string
          customer_id?: string | null
          id?: string
          last_payment_date?: string | null
          next_payment_due?: string | null
          payment_terms_days?: number
          updated_at?: string
          used_credit?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_credit_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_credit_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_credit_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_loyalty_profiles: {
        Row: {
          annual_spent: number | null
          available_points: number
          created_at: string | null
          customer_id: string
          id: string
          last_activity_date: string | null
          lifetime_points: number
          tier_level: string
          tier_start_date: string | null
          total_points: number
          updated_at: string | null
        }
        Insert: {
          annual_spent?: number | null
          available_points?: number
          created_at?: string | null
          customer_id: string
          id?: string
          last_activity_date?: string | null
          lifetime_points?: number
          tier_level?: string
          tier_start_date?: string | null
          total_points?: number
          updated_at?: string | null
        }
        Update: {
          annual_spent?: number | null
          available_points?: number
          created_at?: string | null
          customer_id?: string
          id?: string
          last_activity_date?: string | null
          lifetime_points?: number
          tier_level?: string
          tier_start_date?: string | null
          total_points?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_loyalty_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_loyalty_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_loyalty_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_reward_usage: {
        Row: {
          created_at: string
          customer_id: string
          discount_amount: number | null
          id: string
          notes: string | null
          order_id: string | null
          reward_id: string
          status: string
          updated_at: string
          used_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          discount_amount?: number | null
          id?: string
          notes?: string | null
          order_id?: string | null
          reward_id: string
          status?: string
          updated_at?: string
          used_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          discount_amount?: number | null
          id?: string
          notes?: string | null
          order_id?: string | null
          reward_id?: string
          status?: string
          updated_at?: string
          used_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          annual_revenue_target: number | null
          assigned_sales_person: string | null
          bank_account: string | null
          bank_address: string | null
          bank_branch: string | null
          bank_name: string | null
          banking_correspondent_bank: string | null
          banking_iban: string | null
          banking_routing_number: string | null
          banking_swift_code: string | null
          business_license_url: string | null
          citizen_id: string | null
          compliance_status: string | null
          contact_email_finance: string | null
          contact_person: string | null
          contact_person_finance: string | null
          contact_phone_finance: string | null
          contact_position: string | null
          contact_type: string | null
          created_at: string
          created_by: string | null
          credit_limit: number | null
          customer_type: string
          delivery_rating: number | null
          district: string | null
          email: string | null
          facebook: string | null
          hq_branch: string | null
          id: string
          is_key_account: boolean | null
          is_preferred_supplier: boolean | null
          key_account_notes: string | null
          key_account_tier: string | null
          key_account_weight: number | null
          last_contact_date: string | null
          last_order_date: string | null
          last_synced_at: string | null
          line_id: string | null
          minimum_contact_frequency: number | null
          minimum_order_amount: number | null
          name: string
          next_required_contact: string | null
          notes: string | null
          payment_terms: string | null
          person_type: string | null
          phone: string | null
          postal_code: string | null
          preferred_payment_method: string | null
          price_rating: number | null
          province: string | null
          quality_rating: number | null
          source_system: string | null
          status: string | null
          sub_district: string | null
          supplier_category: string | null
          supplier_code: string | null
          supplier_country: string | null
          supplier_currency: string | null
          supplier_notes: string | null
          swift_code: string | null
          sync_status: string | null
          tax_certificate_url: string | null
          tax_id: string | null
          total_orders_count: number | null
          total_orders_value: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          annual_revenue_target?: number | null
          assigned_sales_person?: string | null
          bank_account?: string | null
          bank_address?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          banking_correspondent_bank?: string | null
          banking_iban?: string | null
          banking_routing_number?: string | null
          banking_swift_code?: string | null
          business_license_url?: string | null
          citizen_id?: string | null
          compliance_status?: string | null
          contact_email_finance?: string | null
          contact_person?: string | null
          contact_person_finance?: string | null
          contact_phone_finance?: string | null
          contact_position?: string | null
          contact_type?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          customer_type?: string
          delivery_rating?: number | null
          district?: string | null
          email?: string | null
          facebook?: string | null
          hq_branch?: string | null
          id?: string
          is_key_account?: boolean | null
          is_preferred_supplier?: boolean | null
          key_account_notes?: string | null
          key_account_tier?: string | null
          key_account_weight?: number | null
          last_contact_date?: string | null
          last_order_date?: string | null
          last_synced_at?: string | null
          line_id?: string | null
          minimum_contact_frequency?: number | null
          minimum_order_amount?: number | null
          name: string
          next_required_contact?: string | null
          notes?: string | null
          payment_terms?: string | null
          person_type?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_payment_method?: string | null
          price_rating?: number | null
          province?: string | null
          quality_rating?: number | null
          source_system?: string | null
          status?: string | null
          sub_district?: string | null
          supplier_category?: string | null
          supplier_code?: string | null
          supplier_country?: string | null
          supplier_currency?: string | null
          supplier_notes?: string | null
          swift_code?: string | null
          sync_status?: string | null
          tax_certificate_url?: string | null
          tax_id?: string | null
          total_orders_count?: number | null
          total_orders_value?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          annual_revenue_target?: number | null
          assigned_sales_person?: string | null
          bank_account?: string | null
          bank_address?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          banking_correspondent_bank?: string | null
          banking_iban?: string | null
          banking_routing_number?: string | null
          banking_swift_code?: string | null
          business_license_url?: string | null
          citizen_id?: string | null
          compliance_status?: string | null
          contact_email_finance?: string | null
          contact_person?: string | null
          contact_person_finance?: string | null
          contact_phone_finance?: string | null
          contact_position?: string | null
          contact_type?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          customer_type?: string
          delivery_rating?: number | null
          district?: string | null
          email?: string | null
          facebook?: string | null
          hq_branch?: string | null
          id?: string
          is_key_account?: boolean | null
          is_preferred_supplier?: boolean | null
          key_account_notes?: string | null
          key_account_tier?: string | null
          key_account_weight?: number | null
          last_contact_date?: string | null
          last_order_date?: string | null
          last_synced_at?: string | null
          line_id?: string | null
          minimum_contact_frequency?: number | null
          minimum_order_amount?: number | null
          name?: string
          next_required_contact?: string | null
          notes?: string | null
          payment_terms?: string | null
          person_type?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_payment_method?: string | null
          price_rating?: number | null
          province?: string | null
          quality_rating?: number | null
          source_system?: string | null
          status?: string | null
          sub_district?: string | null
          supplier_category?: string | null
          supplier_code?: string | null
          supplier_country?: string | null
          supplier_currency?: string | null
          supplier_notes?: string | null
          swift_code?: string | null
          sync_status?: string | null
          tax_certificate_url?: string | null
          tax_id?: string | null
          total_orders_count?: number | null
          total_orders_value?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      datasheets: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          language: string | null
          name: string
          subcategory: string | null
          tags: string[] | null
          updated_at: string
          version: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          language?: string | null
          name: string
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          language?: string | null
          name?: string
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      delivery_items: {
        Row: {
          barcode: string | null
          condition_notes: string | null
          created_at: string
          delivery_order_id: string
          id: string
          is_warranty_active: boolean
          item_name: string
          item_sku: string | null
          product_id: string | null
          qr_code: string | null
          quantity: number
          serial_numbers: string[] | null
          total_price: number | null
          unit_price: number | null
          warranty_end_date: string | null
          warranty_period_days: number | null
          warranty_start_date: string | null
        }
        Insert: {
          barcode?: string | null
          condition_notes?: string | null
          created_at?: string
          delivery_order_id: string
          id?: string
          is_warranty_active?: boolean
          item_name: string
          item_sku?: string | null
          product_id?: string | null
          qr_code?: string | null
          quantity?: number
          serial_numbers?: string[] | null
          total_price?: number | null
          unit_price?: number | null
          warranty_end_date?: string | null
          warranty_period_days?: number | null
          warranty_start_date?: string | null
        }
        Update: {
          barcode?: string | null
          condition_notes?: string | null
          created_at?: string
          delivery_order_id?: string
          id?: string
          is_warranty_active?: boolean
          item_name?: string
          item_sku?: string | null
          product_id?: string | null
          qr_code?: string | null
          quantity?: number
          serial_numbers?: string[] | null
          total_price?: number | null
          unit_price?: number | null
          warranty_end_date?: string | null
          warranty_period_days?: number | null
          warranty_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_items_delivery_order_id_fkey"
            columns: ["delivery_order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_media: {
        Row: {
          created_at: string
          delivery_item_id: string | null
          delivery_order_id: string
          description: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          media_stage: string
          media_type: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          delivery_item_id?: string | null
          delivery_order_id: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          media_stage: string
          media_type: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          delivery_item_id?: string | null
          delivery_order_id?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          media_stage?: string
          media_type?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_media_delivery_item_id_fkey"
            columns: ["delivery_item_id"]
            isOneToOne: false
            referencedRelation: "delivery_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_media_delivery_order_id_fkey"
            columns: ["delivery_order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_methods: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          tracking_url_template: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          tracking_url_template?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tracking_url_template?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      delivery_orders: {
        Row: {
          assigned_staff_id: string | null
          assignment_date: string | null
          assignment_notes: string | null
          cod_amount: number | null
          courier_contact_name: string | null
          courier_contact_phone: string | null
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          delivered_date: string | null
          delivery_address: string
          delivery_method_id: string
          delivery_notes: string | null
          delivery_number: string
          dimensions_cm: string | null
          has_insurance: boolean
          id: string
          insurance_cost: number | null
          insurance_value: number | null
          order_type: string
          priority: string
          purchase_order_id: string | null
          repair_order_id: string | null
          scheduled_date: string | null
          shipped_date: string | null
          shipping_cost: number | null
          signature_required: boolean
          special_instructions: string | null
          status: string
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          warranty_tracking_enabled: boolean | null
          weight_kg: number | null
        }
        Insert: {
          assigned_staff_id?: string | null
          assignment_date?: string | null
          assignment_notes?: string | null
          cod_amount?: number | null
          courier_contact_name?: string | null
          courier_contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          delivered_date?: string | null
          delivery_address: string
          delivery_method_id: string
          delivery_notes?: string | null
          delivery_number: string
          dimensions_cm?: string | null
          has_insurance?: boolean
          id?: string
          insurance_cost?: number | null
          insurance_value?: number | null
          order_type: string
          priority?: string
          purchase_order_id?: string | null
          repair_order_id?: string | null
          scheduled_date?: string | null
          shipped_date?: string | null
          shipping_cost?: number | null
          signature_required?: boolean
          special_instructions?: string | null
          status?: string
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          warranty_tracking_enabled?: boolean | null
          weight_kg?: number | null
        }
        Update: {
          assigned_staff_id?: string | null
          assignment_date?: string | null
          assignment_notes?: string | null
          cod_amount?: number | null
          courier_contact_name?: string | null
          courier_contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          delivered_date?: string | null
          delivery_address?: string
          delivery_method_id?: string
          delivery_notes?: string | null
          delivery_number?: string
          dimensions_cm?: string | null
          has_insurance?: boolean
          id?: string
          insurance_cost?: number | null
          insurance_value?: number | null
          order_type?: string
          priority?: string
          purchase_order_id?: string | null
          repair_order_id?: string | null
          scheduled_date?: string | null
          shipped_date?: string | null
          shipping_cost?: number | null
          signature_required?: boolean
          special_instructions?: string | null
          status?: string
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          warranty_tracking_enabled?: boolean | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_orders_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_delivery_method_id_fkey"
            columns: ["delivery_method_id"]
            isOneToOne: false
            referencedRelation: "delivery_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_repair_order_id_fkey"
            columns: ["repair_order_id"]
            isOneToOne: false
            referencedRelation: "repair_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_tracking: {
        Row: {
          created_at: string
          delivery_order_id: string
          id: string
          is_internal: boolean
          location: string | null
          status: string
          status_message: string
          tracking_date: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          delivery_order_id: string
          id?: string
          is_internal?: boolean
          location?: string | null
          status: string
          status_message: string
          tracking_date?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          delivery_order_id?: string
          id?: string
          is_internal?: boolean
          location?: string | null
          status?: string
          status_message?: string
          tracking_date?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_delivery_order_id_fkey"
            columns: ["delivery_order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      device_brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_models: {
        Row: {
          brand_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          type_id: string | null
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type_id?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "device_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_models_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "device_types"
            referencedColumns: ["id"]
          },
        ]
      }
      device_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_attendance: {
        Row: {
          address: string | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          employee_id: string
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          notes: string | null
          total_hours: number | null
          updated_at: string
          work_date: string
        }
        Insert: {
          address?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          employee_id: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          total_hours?: number | null
          updated_at?: string
          work_date?: string
        }
        Update: {
          address?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          total_hours?: number | null
          updated_at?: string
          work_date?: string
        }
        Relationships: []
      }
      international_transfer_requests: {
        Row: {
          actual_exchange_rate: number | null
          actual_transfer_amount: number | null
          approved_at: string | null
          approved_by: string | null
          attachment_urls: string[] | null
          bank_charges: number | null
          created_at: string
          currency: string
          customer_id: string | null
          customer_paid_amount: number | null
          customer_payment_status: string | null
          customer_remaining_amount: number | null
          exchange_rate: number | null
          finance_approved_at: string | null
          finance_approved_by: string | null
          id: string
          internal_notes: string | null
          invoice_reference: string | null
          notes: string | null
          other_charges: number | null
          payment_deadline: string | null
          payment_purpose: string
          priority: string
          purchase_order_number: string | null
          rejection_reason: string | null
          requested_by: string | null
          requested_transfer_date: string
          status: string
          supplier_account_number: string
          supplier_bank_address: string | null
          supplier_bank_name: string
          supplier_id: string | null
          supplier_name: string
          supplier_swift_code: string | null
          thb_equivalent: number | null
          transfer_amount: number
          transfer_executed_at: string | null
          transfer_fee: number | null
          transfer_number: string
          transfer_reference_number: string | null
          updated_at: string
        }
        Insert: {
          actual_exchange_rate?: number | null
          actual_transfer_amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          attachment_urls?: string[] | null
          bank_charges?: number | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_paid_amount?: number | null
          customer_payment_status?: string | null
          customer_remaining_amount?: number | null
          exchange_rate?: number | null
          finance_approved_at?: string | null
          finance_approved_by?: string | null
          id?: string
          internal_notes?: string | null
          invoice_reference?: string | null
          notes?: string | null
          other_charges?: number | null
          payment_deadline?: string | null
          payment_purpose: string
          priority?: string
          purchase_order_number?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          requested_transfer_date: string
          status?: string
          supplier_account_number: string
          supplier_bank_address?: string | null
          supplier_bank_name: string
          supplier_id?: string | null
          supplier_name: string
          supplier_swift_code?: string | null
          thb_equivalent?: number | null
          transfer_amount: number
          transfer_executed_at?: string | null
          transfer_fee?: number | null
          transfer_number: string
          transfer_reference_number?: string | null
          updated_at?: string
        }
        Update: {
          actual_exchange_rate?: number | null
          actual_transfer_amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          attachment_urls?: string[] | null
          bank_charges?: number | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_paid_amount?: number | null
          customer_payment_status?: string | null
          customer_remaining_amount?: number | null
          exchange_rate?: number | null
          finance_approved_at?: string | null
          finance_approved_by?: string | null
          id?: string
          internal_notes?: string | null
          invoice_reference?: string | null
          notes?: string | null
          other_charges?: number | null
          payment_deadline?: string | null
          payment_purpose?: string
          priority?: string
          purchase_order_number?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          requested_transfer_date?: string
          status?: string
          supplier_account_number?: string
          supplier_bank_address?: string | null
          supplier_bank_name?: string
          supplier_id?: string | null
          supplier_name?: string
          supplier_swift_code?: string | null
          thb_equivalent?: number | null
          transfer_amount?: number
          transfer_executed_at?: string | null
          transfer_fee?: number | null
          transfer_number?: string
          transfer_reference_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "international_transfer_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "international_transfer_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "international_transfer_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "international_transfer_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "international_transfer_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "international_transfer_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string | null
          discount_amount: number
          discount_type: string
          id: string
          invoice_id: string | null
          is_software: boolean
          line_total: number
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_amount?: number
          discount_type?: string
          id?: string
          invoice_id?: string | null
          is_software?: boolean
          line_total?: number
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_amount?: number
          discount_type?: string
          id?: string
          invoice_id?: string | null
          is_software?: boolean
          line_total?: number
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          created_by: string | null
          customer_address: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          discount_amount: number
          discount_percentage: number
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          payment_terms: string | null
          po_number: string | null
          project_name: string | null
          quotation_id: string | null
          status: string
          subtotal: number
          terms_conditions: string | null
          total_amount: number
          updated_at: string
          vat_amount: number
          withholding_tax_amount: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number
          discount_percentage?: number
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          payment_terms?: string | null
          po_number?: string | null
          project_name?: string | null
          quotation_id?: string | null
          status?: string
          subtotal?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          withholding_tax_amount?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number
          discount_percentage?: number
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          payment_terms?: string | null
          po_number?: string | null
          project_name?: string | null
          quotation_id?: string | null
          status?: string
          subtotal?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          withholding_tax_amount?: number
        }
        Relationships: []
      }
      key_account_activities: {
        Row: {
          activity_date: string
          activity_type: string
          compliance_notes: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_mandatory: boolean | null
          kpi_weight: number | null
          next_action: string | null
          next_action_date: string | null
          outcome_rating: number | null
          sales_person_id: string
          title: string
          updated_at: string
          was_on_time: boolean | null
        }
        Insert: {
          activity_date?: string
          activity_type: string
          compliance_notes?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          kpi_weight?: number | null
          next_action?: string | null
          next_action_date?: string | null
          outcome_rating?: number | null
          sales_person_id: string
          title: string
          updated_at?: string
          was_on_time?: boolean | null
        }
        Update: {
          activity_date?: string
          activity_type?: string
          compliance_notes?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          kpi_weight?: number | null
          next_action?: string | null
          next_action_date?: string | null
          outcome_rating?: number | null
          sales_person_id?: string
          title?: string
          updated_at?: string
          was_on_time?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "key_account_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_account_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "key_account_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      key_account_kpis: {
        Row: {
          calls_actual: number | null
          calls_target: number | null
          contact_frequency_met: boolean | null
          created_at: string
          customer_id: string
          days_since_last_contact: number | null
          emails_actual: number | null
          emails_target: number | null
          id: string
          last_meeting_date: string | null
          meetings_actual: number | null
          meetings_target: number | null
          month: number
          proposals_actual: number | null
          proposals_target: number | null
          revenue_actual: number | null
          revenue_target: number | null
          sales_person_id: string
          updated_at: string
          year: number
        }
        Insert: {
          calls_actual?: number | null
          calls_target?: number | null
          contact_frequency_met?: boolean | null
          created_at?: string
          customer_id: string
          days_since_last_contact?: number | null
          emails_actual?: number | null
          emails_target?: number | null
          id?: string
          last_meeting_date?: string | null
          meetings_actual?: number | null
          meetings_target?: number | null
          month?: number
          proposals_actual?: number | null
          proposals_target?: number | null
          revenue_actual?: number | null
          revenue_target?: number | null
          sales_person_id: string
          updated_at?: string
          year?: number
        }
        Update: {
          calls_actual?: number | null
          calls_target?: number | null
          contact_frequency_met?: boolean | null
          created_at?: string
          customer_id?: string
          days_since_last_contact?: number | null
          emails_actual?: number | null
          emails_target?: number | null
          id?: string
          last_meeting_date?: string | null
          meetings_actual?: number | null
          meetings_target?: number | null
          month?: number
          proposals_actual?: number | null
          proposals_target?: number | null
          revenue_actual?: number | null
          revenue_target?: number | null
          sales_person_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "key_account_kpis_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_account_kpis_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "key_account_kpis_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      key_account_transfer_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          created_at: string
          current_sales_person: string | null
          customer_id: string
          id: string
          reason: string | null
          rejection_reason: string | null
          request_type: string
          requested_by: string
          requested_sales_person: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          current_sales_person?: string | null
          customer_id: string
          id?: string
          reason?: string | null
          rejection_reason?: string | null
          request_type?: string
          requested_by: string
          requested_sales_person: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          current_sales_person?: string | null
          customer_id?: string
          id?: string
          reason?: string | null
          rejection_reason?: string | null
          request_type?: string
          requested_by?: string
          requested_sales_person?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_campaigns: {
        Row: {
          bonus_points: number | null
          campaign_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          minimum_purchase: number | null
          multiplier: number | null
          name: string
          start_date: string
          target_tier: string | null
          terms_conditions: string | null
          updated_at: string | null
        }
        Insert: {
          bonus_points?: number | null
          campaign_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          minimum_purchase?: number | null
          multiplier?: number | null
          name: string
          start_date: string
          target_tier?: string | null
          terms_conditions?: string | null
          updated_at?: string | null
        }
        Update: {
          bonus_points?: number | null
          campaign_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          minimum_purchase?: number | null
          multiplier?: number | null
          name?: string
          start_date?: string
          target_tier?: string | null
          terms_conditions?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_points_transactions: {
        Row: {
          created_at: string | null
          customer_id: string
          description: string
          expiry_date: string | null
          id: string
          points_amount: number
          processed_by: string | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          description: string
          expiry_date?: string | null
          id?: string
          points_amount: number
          processed_by?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          description?: string
          expiry_date?: string | null
          id?: string
          points_amount?: number
          processed_by?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_points_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "loyalty_points_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_redemptions: {
        Row: {
          created_at: string | null
          customer_id: string
          expires_at: string | null
          id: string
          notes: string | null
          points_used: number
          processed_by: string | null
          redeemed_at: string | null
          redemption_code: string
          reward_id: string
          status: string
          updated_at: string | null
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          points_used: number
          processed_by?: string | null
          redeemed_at?: string | null
          redemption_code: string
          reward_id: string
          status?: string
          updated_at?: string | null
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          points_used?: number
          processed_by?: string | null
          redeemed_at?: string | null
          redemption_code?: string
          reward_id?: string
          status?: string
          updated_at?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "loyalty_redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "loyalty_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          available_quantity: number | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          minimum_tier: string | null
          name: string
          points_required: number
          reward_type: string
          reward_value: number | null
          stock_quantity: number | null
          terms_conditions: string | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          available_quantity?: number | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          minimum_tier?: string | null
          name: string
          points_required: number
          reward_type: string
          reward_value?: number | null
          stock_quantity?: number | null
          terms_conditions?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          available_quantity?: number | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          minimum_tier?: string | null
          name?: string
          points_required?: number
          reward_type?: string
          reward_value?: number | null
          stock_quantity?: number | null
          terms_conditions?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      media_library: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          folder_path: string | null
          id: string
          mime_type: string | null
          original_name: string
          tags: string[] | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          folder_path?: string | null
          id?: string
          mime_type?: string | null
          original_name: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          folder_path?: string | null
          id?: string
          mime_type?: string | null
          original_name?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      meeting_attendees: {
        Row: {
          attendance_status: string | null
          attendee_type: string
          company: string | null
          created_at: string
          email: string | null
          employee_id: string | null
          id: string
          invitation_status: string
          meeting_id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          attendance_status?: string | null
          attendee_type?: string
          company?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          id?: string
          invitation_status?: string
          meeting_id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          attendance_status?: string | null
          attendee_type?: string
          company?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          id?: string
          invitation_status?: string
          meeting_id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendees_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_reminders: {
        Row: {
          created_at: string
          id: string
          meeting_id: string
          recipient_email: string | null
          recipient_id: string | null
          reminder_time: string
          reminder_type: string
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          meeting_id: string
          recipient_email?: string | null
          recipient_id?: string | null
          reminder_time: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          meeting_id?: string
          recipient_email?: string | null
          recipient_id?: string | null
          reminder_time?: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_reminders_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda: string | null
          created_at: string
          created_by: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          description: string | null
          duration_minutes: number | null
          end_date: string
          follow_up_actions: string | null
          id: string
          location: string | null
          meeting_method: string
          meeting_notes: string | null
          meeting_type: string
          meeting_url: string | null
          opportunity_id: string | null
          organizer_id: string
          preparation_notes: string | null
          priority: string
          reminder_date: string | null
          reminder_sent: boolean | null
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          agenda?: string | null
          created_at?: string
          created_by: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_date: string
          follow_up_actions?: string | null
          id?: string
          location?: string | null
          meeting_method?: string
          meeting_notes?: string | null
          meeting_type?: string
          meeting_url?: string | null
          opportunity_id?: string | null
          organizer_id: string
          preparation_notes?: string | null
          priority?: string
          reminder_date?: string | null
          reminder_sent?: boolean | null
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          agenda?: string | null
          created_at?: string
          created_by?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_date?: string
          follow_up_actions?: string | null
          id?: string
          location?: string | null
          meeting_method?: string
          meeting_notes?: string | null
          meeting_type?: string
          meeting_url?: string | null
          opportunity_id?: string | null
          organizer_id?: string
          preparation_notes?: string | null
          priority?: string
          reminder_date?: string | null
          reminder_sent?: boolean | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          priority: string
          read_at: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          priority?: string
          read_at?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          priority?: string
          read_at?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          address: string | null
          assigned_to: string | null
          business_type: string | null
          company_name: string
          created_at: string
          created_by: string | null
          customer_code: string | null
          customer_id: string | null
          description: string | null
          email: string | null
          expected_close_date: string | null
          id: string
          notes: string | null
          phone: string[] | null
          priority: string | null
          probability: number
          source: string | null
          stage: string
          updated_at: string
          value: number
          website: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          business_type?: string | null
          company_name: string
          created_at?: string
          created_by?: string | null
          customer_code?: string | null
          customer_id?: string | null
          description?: string | null
          email?: string | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          phone?: string[] | null
          priority?: string | null
          probability?: number
          source?: string | null
          stage?: string
          updated_at?: string
          value?: number
          website?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          business_type?: string | null
          company_name?: string
          created_at?: string
          created_by?: string | null
          customer_code?: string | null
          customer_id?: string | null
          description?: string | null
          email?: string | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          phone?: string[] | null
          priority?: string | null
          probability?: number
          source?: string | null
          stage?: string
          updated_at?: string
          value?: number
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "opportunities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      page_layouts: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          layout_data: Json
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          layout_data?: Json
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          layout_data?: Json
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_product_registrations: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          dealer_name: string | null
          id: string
          notes: string | null
          product_model: string | null
          product_name: string
          purchase_date: string
          purchase_order_number: string | null
          registration_code: string | null
          serial_number: string
          updated_at: string
          warranty_end_date: string | null
          warranty_period_days: number | null
          warranty_start_date: string
          warranty_status: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          dealer_name?: string | null
          id?: string
          notes?: string | null
          product_model?: string | null
          product_name: string
          purchase_date: string
          purchase_order_number?: string | null
          registration_code?: string | null
          serial_number: string
          updated_at?: string
          warranty_end_date?: string | null
          warranty_period_days?: number | null
          warranty_start_date?: string
          warranty_status?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          dealer_name?: string | null
          id?: string
          notes?: string | null
          product_model?: string | null
          product_name?: string
          purchase_date?: string
          purchase_order_number?: string | null
          registration_code?: string | null
          serial_number?: string
          updated_at?: string
          warranty_end_date?: string | null
          warranty_period_days?: number | null
          warranty_start_date?: string
          warranty_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_product_registrations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_product_registrations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "partner_product_registrations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_shared_documents: {
        Row: {
          category: string
          created_at: string
          customer_id: string
          description: string | null
          download_count: number | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_active: boolean
          shared_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          customer_id: string
          description?: string | null
          download_count?: number | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_active?: boolean
          shared_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          customer_id?: string
          description?: string | null
          download_count?: number | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_active?: boolean
          shared_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_shared_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_shared_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "partner_shared_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_records: {
        Row: {
          amount_received: number
          bank_account: string | null
          bank_name: string | null
          created_at: string
          created_by: string
          depositor_name: string | null
          id: string
          payment_date: string
          payment_evidence_url: string | null
          payment_method: string
          payment_notes: string | null
          payment_number: string
          payment_reference: string | null
          tax_invoice_id: string
          updated_at: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount_received: number
          bank_account?: string | null
          bank_name?: string | null
          created_at?: string
          created_by: string
          depositor_name?: string | null
          id?: string
          payment_date?: string
          payment_evidence_url?: string | null
          payment_method: string
          payment_notes?: string | null
          payment_number: string
          payment_reference?: string | null
          tax_invoice_id: string
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount_received?: number
          bank_account?: string | null
          bank_name?: string | null
          created_at?: string
          created_by?: string
          depositor_name?: string | null
          id?: string
          payment_date?: string
          payment_evidence_url?: string | null
          payment_method?: string
          payment_notes?: string | null
          payment_number?: string
          payment_reference?: string | null
          tax_invoice_id?: string
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_tax_invoice_id_fkey"
            columns: ["tax_invoice_id"]
            isOneToOne: false
            referencedRelation: "tax_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      product_campaigns: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          product_id: string
          special_price: number | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          product_id: string
          special_price?: number | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          product_id?: string
          special_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      product_inquiries: {
        Row: {
          created_at: string
          created_by: string
          customer_id: string | null
          description: string | null
          id: string
          inquiry_number: string | null
          max_budget: number | null
          opportunity_id: string | null
          priority: string
          product_category: string
          product_name: string
          quantity: number
          required_delivery_date: string | null
          requirements: string | null
          sent_to_suppliers: string[] | null
          specifications: Json
          status: string
          target_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          customer_id?: string | null
          description?: string | null
          id?: string
          inquiry_number?: string | null
          max_budget?: number | null
          opportunity_id?: string | null
          priority?: string
          product_category: string
          product_name: string
          quantity: number
          required_delivery_date?: string | null
          requirements?: string | null
          sent_to_suppliers?: string[] | null
          specifications?: Json
          status?: string
          target_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          inquiry_number?: string | null
          max_budget?: number | null
          opportunity_id?: string | null
          priority?: string
          product_category?: string
          product_name?: string
          quantity?: number
          required_delivery_date?: string | null
          requirements?: string | null
          sent_to_suppliers?: string[] | null
          specifications?: Json
          status?: string
          target_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_inquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "product_inquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inquiries_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      product_positions: {
        Row: {
          created_at: string
          height: number | null
          id: string
          is_featured: boolean | null
          position_x: number | null
          position_y: number | null
          product_data: Json | null
          product_id: string | null
          section_id: string | null
          updated_at: string
          width: number | null
          z_index: number | null
        }
        Insert: {
          created_at?: string
          height?: number | null
          id?: string
          is_featured?: boolean | null
          position_x?: number | null
          position_y?: number | null
          product_data?: Json | null
          product_id?: string | null
          section_id?: string | null
          updated_at?: string
          width?: number | null
          z_index?: number | null
        }
        Update: {
          created_at?: string
          height?: number | null
          id?: string
          is_featured?: boolean | null
          position_x?: number | null
          position_y?: number | null
          product_data?: Json | null
          product_id?: string | null
          section_id?: string | null
          updated_at?: string
          width?: number | null
          z_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_positions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "content_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      product_warranties: {
        Row: {
          claim_count: number
          created_at: string
          customer_id: string | null
          delivery_item_id: string
          id: string
          notes: string | null
          product_name: string
          registered_by_customer: boolean
          registration_code: string | null
          registration_date: string | null
          serial_number: string | null
          status: string
          updated_at: string
          warranty_end_date: string
          warranty_start_date: string
          warranty_type: string
        }
        Insert: {
          claim_count?: number
          created_at?: string
          customer_id?: string | null
          delivery_item_id: string
          id?: string
          notes?: string | null
          product_name: string
          registered_by_customer?: boolean
          registration_code?: string | null
          registration_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
          warranty_end_date: string
          warranty_start_date: string
          warranty_type?: string
        }
        Update: {
          claim_count?: number
          created_at?: string
          customer_id?: string | null
          delivery_item_id?: string
          id?: string
          notes?: string | null
          product_name?: string
          registered_by_customer?: boolean
          registration_code?: string | null
          registration_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
          warranty_end_date?: string
          warranty_start_date?: string
          warranty_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_warranties_delivery_item_id_fkey"
            columns: ["delivery_item_id"]
            isOneToOne: false
            referencedRelation: "delivery_items"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          campaign_description: string | null
          campaign_eligible: boolean | null
          campaign_end_date: string | null
          campaign_start_date: string | null
          category: string | null
          china_factory_promo: boolean | null
          created_at: string
          description: string | null
          id: string
          is_software: boolean
          item_condition: string | null
          last_synced_at: string | null
          name: string
          original_china_price: number | null
          price: number
          repair_notes: string | null
          repair_order_id: string | null
          repaired_date: string | null
          service_request_id: string | null
          sku: string
          source_system: string | null
          special_campaign_price: number | null
          status: string
          stock: number
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          campaign_description?: string | null
          campaign_eligible?: boolean | null
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          category?: string | null
          china_factory_promo?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          is_software?: boolean
          item_condition?: string | null
          last_synced_at?: string | null
          name: string
          original_china_price?: number | null
          price?: number
          repair_notes?: string | null
          repair_order_id?: string | null
          repaired_date?: string | null
          service_request_id?: string | null
          sku: string
          source_system?: string | null
          special_campaign_price?: number | null
          status?: string
          stock?: number
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          campaign_description?: string | null
          campaign_eligible?: boolean | null
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          category?: string | null
          china_factory_promo?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          is_software?: boolean
          item_condition?: string | null
          last_synced_at?: string | null
          name?: string
          original_china_price?: number | null
          price?: number
          repair_notes?: string | null
          repair_order_id?: string | null
          repaired_date?: string | null
          service_request_id?: string | null
          sku?: string
          source_system?: string | null
          special_campaign_price?: number | null
          status?: string
          stock?: number
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_repair_order_id_fkey"
            columns: ["repair_order_id"]
            isOneToOne: false
            referencedRelation: "repair_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          discount_amount: number | null
          id: string
          line_total: number
          notes: string | null
          product_name: string
          product_sku: string | null
          purchase_order_id: string
          quantity: number
          supplier_product_id: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          id?: string
          line_total?: number
          notes?: string | null
          product_name: string
          product_sku?: string | null
          purchase_order_id: string
          quantity?: number
          supplier_product_id?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          id?: string
          line_total?: number
          notes?: string | null
          product_name?: string
          product_sku?: string | null
          purchase_order_id?: string
          quantity?: number
          supplier_product_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_supplier_product_id_fkey"
            columns: ["supplier_product_id"]
            isOneToOne: false
            referencedRelation: "supplier_products"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          customer_company: string | null
          customer_id: string | null
          customer_name: string
          delivery_date: string | null
          id: string
          notes: string | null
          po_date: string
          po_number: string
          status: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_company?: string | null
          customer_id?: string | null
          customer_name: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          po_date?: string
          po_number: string
          status?: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_company?: string | null
          customer_id?: string | null
          customer_name?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          po_date?: string
          po_number?: string
          status?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          created_at: string
          description: string | null
          discount_amount: number
          discount_percentage: number
          id: string
          is_software: boolean
          line_total: number
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          quotation_id: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_amount?: number
          discount_percentage?: number
          id?: string
          is_software?: boolean
          line_total?: number
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity?: number
          quotation_id?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_amount?: number
          discount_percentage?: number
          id?: string
          is_software?: boolean
          line_total?: number
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          quotation_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_workflow_history: {
        Row: {
          action_type: string
          created_at: string
          from_status: Database["public"]["Enums"]["quotation_status"] | null
          id: string
          notes: string | null
          performed_by: string | null
          quotation_id: string
          to_status: Database["public"]["Enums"]["quotation_status"]
        }
        Insert: {
          action_type: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["quotation_status"] | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          quotation_id: string
          to_status: Database["public"]["Enums"]["quotation_status"]
        }
        Update: {
          action_type?: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["quotation_status"] | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          quotation_id?: string
          to_status?: Database["public"]["Enums"]["quotation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "quotation_workflow_history_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bonus_eligible: boolean | null
          bonus_reason: string | null
          created_at: string
          created_by: string | null
          customer_address: string | null
          customer_branch: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          discount_amount: number
          discount_percentage: number
          erp_reference_id: string | null
          id: string
          is_repeat_customer: boolean | null
          next_document_type: string | null
          notes: string | null
          parent_quotation_id: string | null
          process_type: Database["public"]["Enums"]["process_type"] | null
          quotation_date: string
          quotation_number: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          source_system: string | null
          status: string
          subtotal: number
          sync_status: string | null
          synced_to_erp_at: string | null
          terms_conditions: string | null
          total_amount: number
          updated_at: string
          valid_until: string | null
          vat_amount: number
          withholding_tax_amount: number
          workflow_status:
            | Database["public"]["Enums"]["quotation_status"]
            | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bonus_eligible?: boolean | null
          bonus_reason?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_branch?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number
          discount_percentage?: number
          erp_reference_id?: string | null
          id?: string
          is_repeat_customer?: boolean | null
          next_document_type?: string | null
          notes?: string | null
          parent_quotation_id?: string | null
          process_type?: Database["public"]["Enums"]["process_type"] | null
          quotation_date?: string
          quotation_number: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          source_system?: string | null
          status?: string
          subtotal?: number
          sync_status?: string | null
          synced_to_erp_at?: string | null
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
          withholding_tax_amount?: number
          workflow_status?:
            | Database["public"]["Enums"]["quotation_status"]
            | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bonus_eligible?: boolean | null
          bonus_reason?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_branch?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number
          discount_percentage?: number
          erp_reference_id?: string | null
          id?: string
          is_repeat_customer?: boolean | null
          next_document_type?: string | null
          notes?: string | null
          parent_quotation_id?: string | null
          process_type?: Database["public"]["Enums"]["process_type"] | null
          quotation_date?: string
          quotation_number?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          source_system?: string | null
          status?: string
          subtotal?: number
          sync_status?: string | null
          synced_to_erp_at?: string | null
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
          withholding_tax_amount?: number
          workflow_status?:
            | Database["public"]["Enums"]["quotation_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_parent_quotation_id_fkey"
            columns: ["parent_quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_items: {
        Row: {
          created_at: string
          document_date: string
          document_number: string
          due_date: string | null
          id: string
          payment_amount: number
          receipt_id: string | null
          sequence_number: number
          subtotal_before_tax: number
        }
        Insert: {
          created_at?: string
          document_date: string
          document_number: string
          due_date?: string | null
          id?: string
          payment_amount?: number
          receipt_id?: string | null
          sequence_number?: number
          subtotal_before_tax?: number
        }
        Update: {
          created_at?: string
          document_date?: string
          document_number?: string
          due_date?: string | null
          id?: string
          payment_amount?: number
          receipt_id?: string | null
          sequence_number?: number
          subtotal_before_tax?: number
        }
        Relationships: [
          {
            foreignKeyName: "receipt_items_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          amount_change: number
          amount_paid: number
          bank_account: string | null
          bank_name: string | null
          can_issue_receipt: boolean
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          customer_address: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          discount_amount: number
          discount_percentage: number
          id: string
          invoice_id: string | null
          notes: string | null
          payment_method: string
          payment_record_id: string | null
          payment_reference: string | null
          payment_status: string
          receipt_date: string
          receipt_number: string
          subtotal: number
          tax_invoice_id: string
          terms_conditions: string | null
          total_amount: number
          updated_at: string
          vat_amount: number
          withholding_tax_amount: number
        }
        Insert: {
          amount_change?: number
          amount_paid?: number
          bank_account?: string | null
          bank_name?: string | null
          can_issue_receipt?: boolean
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number
          discount_percentage?: number
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method?: string
          payment_record_id?: string | null
          payment_reference?: string | null
          payment_status?: string
          receipt_date?: string
          receipt_number: string
          subtotal?: number
          tax_invoice_id: string
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          withholding_tax_amount?: number
        }
        Update: {
          amount_change?: number
          amount_paid?: number
          bank_account?: string | null
          bank_name?: string | null
          can_issue_receipt?: boolean
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number
          discount_percentage?: number
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method?: string
          payment_record_id?: string | null
          payment_reference?: string | null
          payment_status?: string
          receipt_date?: string
          receipt_number?: string
          subtotal?: number
          tax_invoice_id?: string
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          withholding_tax_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "receipts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "receipts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_payment_record_id_fkey"
            columns: ["payment_record_id"]
            isOneToOne: false
            referencedRelation: "payment_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_tax_invoice_id_fkey"
            columns: ["tax_invoice_id"]
            isOneToOne: false
            referencedRelation: "tax_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_orders: {
        Row: {
          actual_completion_date: string | null
          completed_by: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          expected_completion_date: string | null
          id: string
          item_description: string
          parts_cost: number | null
          problem_description: string | null
          received_by: string | null
          received_date: string
          repair_cost: number | null
          repair_notes: string | null
          repair_number: string
          status: string
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          completed_by?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          expected_completion_date?: string | null
          id?: string
          item_description: string
          parts_cost?: number | null
          problem_description?: string | null
          received_by?: string | null
          received_date?: string
          repair_cost?: number | null
          repair_notes?: string | null
          repair_number: string
          status?: string
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          completed_by?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          expected_completion_date?: string | null
          id?: string
          item_description?: string
          parts_cost?: number | null
          problem_description?: string | null
          received_by?: string | null
          received_date?: string
          repair_cost?: number | null
          repair_notes?: string | null
          repair_number?: string
          status?: string
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      rfq: {
        Row: {
          company_name: string | null
          created_at: string
          created_by: string | null
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          delivery_date: string | null
          external_rfq_id: string | null
          id: string
          notes: string | null
          project_name: string | null
          rfq_number: string
          status: string
          sync_status: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          delivery_date?: string | null
          external_rfq_id?: string | null
          id?: string
          notes?: string | null
          project_name?: string | null
          rfq_number: string
          status?: string
          sync_status?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_date?: string | null
          external_rfq_id?: string | null
          id?: string
          notes?: string | null
          project_name?: string | null
          rfq_number?: string
          status?: string
          sync_status?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      rfq_items: {
        Row: {
          created_at: string
          id: string
          model: string
          product_id: string
          product_name: string
          quantity: number
          rfq_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          model: string
          product_id: string
          product_name: string
          quantity: number
          rfq_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          model?: string
          product_id?: string
          product_name?: string
          quantity?: number
          rfq_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "rfq_items_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfq"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_performance: {
        Row: {
          achievement_percent: number | null
          average_deal_size: number | null
          closing_rate: number | null
          commission_amount: number | null
          conversion_rate: number | null
          created_at: string
          id: string
          invoices_paid: number | null
          monthly_target: number | null
          period_month: number
          period_year: number
          quotations_approved: number | null
          quotations_created: number | null
          quotations_value: number | null
          receipts_value: number | null
          sales_person_id: string
          updated_at: string
        }
        Insert: {
          achievement_percent?: number | null
          average_deal_size?: number | null
          closing_rate?: number | null
          commission_amount?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          invoices_paid?: number | null
          monthly_target?: number | null
          period_month?: number
          period_year?: number
          quotations_approved?: number | null
          quotations_created?: number | null
          quotations_value?: number | null
          receipts_value?: number | null
          sales_person_id: string
          updated_at?: string
        }
        Update: {
          achievement_percent?: number | null
          average_deal_size?: number | null
          closing_rate?: number | null
          commission_amount?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          invoices_paid?: number | null
          monthly_target?: number | null
          period_month?: number
          period_year?: number
          quotations_approved?: number | null
          quotations_created?: number | null
          quotations_value?: number | null
          receipts_value?: number | null
          sales_person_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales_receipts: {
        Row: {
          bank_name: string | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string
          customer_id: string | null
          customer_name: string
          erp_invoice_id: string | null
          erp_receipt_id: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_reference: string | null
          quotation_id: string | null
          receipt_date: string
          receipt_number: string
          sales_person_id: string | null
          source_system: string | null
          status: string
          subtotal: number
          sync_status: string | null
          synced_from_erp_at: string | null
          total_amount: number
          updated_at: string
          vat_amount: number
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          bank_name?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          erp_invoice_id?: string | null
          erp_receipt_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          quotation_id?: string | null
          receipt_date?: string
          receipt_number: string
          sales_person_id?: string | null
          source_system?: string | null
          status?: string
          subtotal?: number
          sync_status?: string | null
          synced_from_erp_at?: string | null
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          bank_name?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          erp_invoice_id?: string | null
          erp_receipt_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          quotation_id?: string | null
          receipt_date?: string
          receipt_number?: string
          sales_person_id?: string | null
          source_system?: string | null
          status?: string
          subtotal?: number
          sync_status?: string | null
          synced_from_erp_at?: string | null
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      sales_targets: {
        Row: {
          commission_target: number | null
          created_at: string
          created_by: string | null
          id: string
          quotation_target: number | null
          revenue_target: number | null
          sales_person_id: string
          target_month: number | null
          target_period: string | null
          target_year: number
          updated_at: string
        }
        Insert: {
          commission_target?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          quotation_target?: number | null
          revenue_target?: number | null
          sales_person_id: string
          target_month?: number | null
          target_period?: string | null
          target_year: number
          updated_at?: string
        }
        Update: {
          commission_target?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          quotation_target?: number | null
          revenue_target?: number | null
          sales_person_id?: string
          target_month?: number | null
          target_period?: string | null
          target_year?: number
          updated_at?: string
        }
        Relationships: []
      }
      service_images: {
        Row: {
          description: string | null
          google_drive_id: string | null
          id: string
          image_url: string
          service_request_id: string | null
          uploaded_at: string
        }
        Insert: {
          description?: string | null
          google_drive_id?: string | null
          id?: string
          image_url: string
          service_request_id?: string | null
          uploaded_at?: string
        }
        Update: {
          description?: string | null
          google_drive_id?: string | null
          id?: string
          image_url?: string
          service_request_id?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_images_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_parts: {
        Row: {
          created_at: string
          id: string
          part_name: string
          part_number: string | null
          quantity: number
          service_request_id: string | null
          supplier: string | null
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          part_name: string
          part_number?: string | null
          quantity?: number
          service_request_id?: string | null
          supplier?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          part_name?: string
          part_number?: string | null
          quantity?: number
          service_request_id?: string | null
          supplier?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_parts_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          acknowledged_at: string | null
          acknowledgment_notes: string | null
          actual_cost: number | null
          assigned_technician_id: string | null
          completed_date: string | null
          created_at: string
          created_by: string | null
          customer_address: string
          customer_email: string
          customer_feedback: string | null
          customer_id: string | null
          customer_line_id: string | null
          customer_name: string
          customer_phone: string
          customer_satisfaction: number | null
          device_brand: string | null
          device_model: string | null
          device_type: string
          estimated_cost: number | null
          id: string
          internal_notes: string | null
          labor_cost: number | null
          parts_cost: number | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          problem_description: string
          scheduled_date: string | null
          source: string
          status: Database["public"]["Enums"]["service_status"] | null
          ticket_number: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledgment_notes?: string | null
          actual_cost?: number | null
          assigned_technician_id?: string | null
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_address: string
          customer_email: string
          customer_feedback?: string | null
          customer_id?: string | null
          customer_line_id?: string | null
          customer_name: string
          customer_phone: string
          customer_satisfaction?: number | null
          device_brand?: string | null
          device_model?: string | null
          device_type: string
          estimated_cost?: number | null
          id?: string
          internal_notes?: string | null
          labor_cost?: number | null
          parts_cost?: number | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          problem_description: string
          scheduled_date?: string | null
          source?: string
          status?: Database["public"]["Enums"]["service_status"] | null
          ticket_number: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledgment_notes?: string | null
          actual_cost?: number | null
          assigned_technician_id?: string | null
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string
          customer_email?: string
          customer_feedback?: string | null
          customer_id?: string | null
          customer_line_id?: string | null
          customer_name?: string
          customer_phone?: string
          customer_satisfaction?: number | null
          device_brand?: string | null
          device_model?: string | null
          device_type?: string
          estimated_cost?: number | null
          id?: string
          internal_notes?: string | null
          labor_cost?: number | null
          parts_cost?: number | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          problem_description?: string
          scheduled_date?: string | null
          source?: string
          status?: Database["public"]["Enums"]["service_status"] | null
          ticket_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_assigned_technician_id_fkey"
            columns: ["assigned_technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "service_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      service_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["service_status"]
          notes: string | null
          old_status: Database["public"]["Enums"]["service_status"] | null
          service_request_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["service_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["service_status"] | null
          service_request_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["service_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["service_status"] | null
          service_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_status_history_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_tickets: {
        Row: {
          actual_cost: number | null
          assigned_technician: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          created_date: string
          customer_id: string | null
          customer_name: string
          erp_ticket_id: string | null
          estimated_cost: number | null
          id: string
          issue_description: string
          last_synced_at: string | null
          parts_used: Json | null
          priority: string
          product_model: string | null
          resolution_notes: string | null
          resolved_date: string | null
          serial_number: string | null
          service_location: string | null
          service_type: string | null
          status: string
          sync_status: string | null
          ticket_number: string
          updated_at: string
          warranty_expire_date: string | null
          warranty_status: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_technician?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          created_date?: string
          customer_id?: string | null
          customer_name: string
          erp_ticket_id?: string | null
          estimated_cost?: number | null
          id?: string
          issue_description: string
          last_synced_at?: string | null
          parts_used?: Json | null
          priority?: string
          product_model?: string | null
          resolution_notes?: string | null
          resolved_date?: string | null
          serial_number?: string | null
          service_location?: string | null
          service_type?: string | null
          status?: string
          sync_status?: string | null
          ticket_number: string
          updated_at?: string
          warranty_expire_date?: string | null
          warranty_status?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_technician?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          created_date?: string
          customer_id?: string | null
          customer_name?: string
          erp_ticket_id?: string | null
          estimated_cost?: number | null
          id?: string
          issue_description?: string
          last_synced_at?: string | null
          parts_used?: Json | null
          priority?: string
          product_model?: string | null
          resolution_notes?: string | null
          resolved_date?: string | null
          serial_number?: string | null
          service_location?: string | null
          service_type?: string | null
          status?: string
          sync_status?: string | null
          ticket_number?: string
          updated_at?: string
          warranty_expire_date?: string | null
          warranty_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "service_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      special_bonuses: {
        Row: {
          awarded_at: string
          awarded_by: string
          bonus_amount: number
          bonus_reason: string | null
          created_at: string
          id: string
          quotation_id: string | null
          sales_person_id: string
          updated_at: string
        }
        Insert: {
          awarded_at?: string
          awarded_by: string
          bonus_amount?: number
          bonus_reason?: string | null
          created_at?: string
          id?: string
          quotation_id?: string | null
          sales_person_id: string
          updated_at?: string
        }
        Update: {
          awarded_at?: string
          awarded_by?: string
          bonus_amount?: number
          bonus_reason?: string | null
          created_at?: string
          id?: string
          quotation_id?: string | null
          sales_person_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_bonuses_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string
          created_by: string | null
          current_workload: number
          department: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          hire_date: string | null
          id: string
          is_active: boolean
          is_available: boolean
          license_number: string | null
          line_id: string | null
          max_workload: number
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          rating: number | null
          salary: number | null
          staff_code: string
          successful_deliveries: number | null
          total_deliveries: number | null
          updated_at: string
          user_id: string | null
          vehicle_plate: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_workload?: number
          department?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean
          is_available?: boolean
          license_number?: string | null
          line_id?: string | null
          max_workload?: number
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          rating?: number | null
          salary?: number | null
          staff_code: string
          successful_deliveries?: number | null
          total_deliveries?: number | null
          updated_at?: string
          user_id?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_workload?: number
          department?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean
          is_available?: boolean
          license_number?: string | null
          line_id?: string | null
          max_workload?: number
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          rating?: number | null
          salary?: number | null
          staff_code?: string
          successful_deliveries?: number | null
          total_deliveries?: number | null
          updated_at?: string
          user_id?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      supplier_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      supplier_documents: {
        Row: {
          created_at: string
          document_date: string | null
          document_number: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          metadata: Json | null
          purchase_order_id: string | null
          status: string | null
          supplier_id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_date?: string | null
          document_number?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          metadata?: Json | null
          purchase_order_id?: string | null
          status?: string | null
          supplier_id: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_date?: string | null
          document_number?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          metadata?: Json | null
          purchase_order_id?: string | null
          status?: string | null
          supplier_id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_documents_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_documents_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_evaluations: {
        Row: {
          comments: string | null
          communication_score: number
          created_at: string
          delivery_score: number
          evaluation_date: string
          evaluator_id: string
          id: string
          inquiry_id: string | null
          overall_score: number
          price_score: number
          quality_score: number
          recommendations: string | null
          supplier_id: string
          updated_at: string
        }
        Insert: {
          comments?: string | null
          communication_score: number
          created_at?: string
          delivery_score: number
          evaluation_date?: string
          evaluator_id: string
          id?: string
          inquiry_id?: string | null
          overall_score: number
          price_score: number
          quality_score: number
          recommendations?: string | null
          supplier_id: string
          updated_at?: string
        }
        Update: {
          comments?: string | null
          communication_score?: number
          created_at?: string
          delivery_score?: number
          evaluation_date?: string
          evaluator_id?: string
          id?: string
          inquiry_id?: string | null
          overall_score?: number
          price_score?: number
          quality_score?: number
          recommendations?: string | null
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_evaluations_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "product_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_evaluations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payment_history: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          exchange_rate: number | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference_number: string | null
          status: string | null
          supplier_id: string | null
          thb_amount: number | null
          transfer_request_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          exchange_rate?: number | null
          id?: string
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          reference_number?: string | null
          status?: string | null
          supplier_id?: string | null
          thb_amount?: number | null
          transfer_request_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          exchange_rate?: number | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          status?: string | null
          supplier_id?: string | null
          thb_amount?: number | null
          transfer_request_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payment_history_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payment_history_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "supplier_payment_history_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payment_history_transfer_request_id_fkey"
            columns: ["transfer_request_id"]
            isOneToOne: false
            referencedRelation: "international_transfer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_products: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          minimum_order_qty: number | null
          model: string | null
          product_name: string
          product_sku: string | null
          specifications: Json | null
          stock_quantity: number | null
          supplier_id: string
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          minimum_order_qty?: number | null
          model?: string | null
          product_name: string
          product_sku?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          supplier_id: string
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          minimum_order_qty?: number | null
          model?: string | null
          product_name?: string
          product_sku?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          supplier_id?: string
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_promotions: {
        Row: {
          applicable_products: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          end_date: string
          id: string
          minimum_amount: number | null
          minimum_quantity: number | null
          promotion_title: string
          promotion_type: string
          start_date: string
          status: string
          supplier_id: string
          terms_conditions: Json | null
          updated_at: string
        }
        Insert: {
          applicable_products?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          end_date: string
          id?: string
          minimum_amount?: number | null
          minimum_quantity?: number | null
          promotion_title: string
          promotion_type?: string
          start_date: string
          status?: string
          supplier_id: string
          terms_conditions?: Json | null
          updated_at?: string
        }
        Update: {
          applicable_products?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          end_date?: string
          id?: string
          minimum_amount?: number | null
          minimum_quantity?: number | null
          promotion_title?: string
          promotion_type?: string
          start_date?: string
          status?: string
          supplier_id?: string
          terms_conditions?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_promotions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_registration_documents: {
        Row: {
          document_name: string
          document_type: string
          file_size: number | null
          file_url: string
          id: string
          supplier_registration_id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          document_name: string
          document_type: string
          file_size?: number | null
          file_url: string
          id?: string
          supplier_registration_id: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          document_name?: string
          document_type?: string
          file_size?: number | null
          file_url?: string
          id?: string
          supplier_registration_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_registration_documents_registration_id_fkey"
            columns: ["supplier_registration_id"]
            isOneToOne: false
            referencedRelation: "supplier_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_registration_history: {
        Row: {
          action: string
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
          performed_at: string
          performed_by: string | null
          step_number: number | null
          supplier_registration_id: string
        }
        Insert: {
          action: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          performed_at?: string
          performed_by?: string | null
          step_number?: number | null
          supplier_registration_id: string
        }
        Update: {
          action?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          performed_at?: string
          performed_by?: string | null
          step_number?: number | null
          supplier_registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_registration_history_registration_id_fkey"
            columns: ["supplier_registration_id"]
            isOneToOne: false
            referencedRelation: "supplier_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_registration_steps: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          required_fields: string[] | null
          step_description: string | null
          step_name: string
          step_number: number
          step_title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          required_fields?: string[] | null
          step_description?: string | null
          step_name: string
          step_number: number
          step_title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          required_fields?: string[] | null
          step_description?: string | null
          step_name?: string
          step_number?: number
          step_title?: string
        }
        Relationships: []
      }
      supplier_registrations: {
        Row: {
          annual_revenue: number | null
          approved_at: string | null
          business_license_expiry: string | null
          business_license_number: string | null
          business_plan_summary: string | null
          company_address: string | null
          company_email: string | null
          company_name: string
          company_phone: string | null
          company_type: string
          contact_person_email: string
          contact_person_name: string
          contact_person_phone: string | null
          contact_person_position: string | null
          created_at: string
          created_by: string | null
          current_brands: string[] | null
          current_step: number
          established_year: number | null
          expected_annual_sales: number | null
          financial_support_needed: boolean | null
          id: string
          marketing_support_needed: boolean | null
          number_of_employees: number | null
          registration_status: string
          rejected_at: string | null
          rejection_reason: string | null
          requested_support_types: string[] | null
          reviewed_at: string | null
          sales_channels: string[] | null
          submitted_at: string | null
          target_market: string[] | null
          tax_id: string | null
          technical_support_needed: boolean | null
          training_support_needed: boolean | null
          updated_at: string
          website: string | null
          why_partner_with_entgroup: string | null
        }
        Insert: {
          annual_revenue?: number | null
          approved_at?: string | null
          business_license_expiry?: string | null
          business_license_number?: string | null
          business_plan_summary?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name: string
          company_phone?: string | null
          company_type?: string
          contact_person_email: string
          contact_person_name: string
          contact_person_phone?: string | null
          contact_person_position?: string | null
          created_at?: string
          created_by?: string | null
          current_brands?: string[] | null
          current_step?: number
          established_year?: number | null
          expected_annual_sales?: number | null
          financial_support_needed?: boolean | null
          id?: string
          marketing_support_needed?: boolean | null
          number_of_employees?: number | null
          registration_status?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          requested_support_types?: string[] | null
          reviewed_at?: string | null
          sales_channels?: string[] | null
          submitted_at?: string | null
          target_market?: string[] | null
          tax_id?: string | null
          technical_support_needed?: boolean | null
          training_support_needed?: boolean | null
          updated_at?: string
          website?: string | null
          why_partner_with_entgroup?: string | null
        }
        Update: {
          annual_revenue?: number | null
          approved_at?: string | null
          business_license_expiry?: string | null
          business_license_number?: string | null
          business_plan_summary?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          company_type?: string
          contact_person_email?: string
          contact_person_name?: string
          contact_person_phone?: string | null
          contact_person_position?: string | null
          created_at?: string
          created_by?: string | null
          current_brands?: string[] | null
          current_step?: number
          established_year?: number | null
          expected_annual_sales?: number | null
          financial_support_needed?: boolean | null
          id?: string
          marketing_support_needed?: boolean | null
          number_of_employees?: number | null
          registration_status?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          requested_support_types?: string[] | null
          reviewed_at?: string | null
          sales_channels?: string[] | null
          submitted_at?: string | null
          target_market?: string[] | null
          tax_id?: string | null
          technical_support_needed?: boolean | null
          training_support_needed?: boolean | null
          updated_at?: string
          website?: string | null
          why_partner_with_entgroup?: string | null
        }
        Relationships: []
      }
      supplier_responses: {
        Row: {
          compliance_certificates: string[] | null
          created_at: string
          delivery_time_days: number | null
          id: string
          inquiry_id: string
          minimum_order_quantity: number | null
          notes: string | null
          payment_terms: string | null
          product_specifications: Json | null
          quantity_available: number | null
          response_date: string | null
          response_status: string
          sample_available: boolean | null
          supplier_id: string
          total_price: number | null
          unit_price: number | null
          updated_at: string
          valid_until: string | null
          warranty_period_days: number | null
        }
        Insert: {
          compliance_certificates?: string[] | null
          created_at?: string
          delivery_time_days?: number | null
          id?: string
          inquiry_id: string
          minimum_order_quantity?: number | null
          notes?: string | null
          payment_terms?: string | null
          product_specifications?: Json | null
          quantity_available?: number | null
          response_date?: string | null
          response_status?: string
          sample_available?: boolean | null
          supplier_id: string
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
          valid_until?: string | null
          warranty_period_days?: number | null
        }
        Update: {
          compliance_certificates?: string[] | null
          created_at?: string
          delivery_time_days?: number | null
          id?: string
          inquiry_id?: string
          minimum_order_quantity?: number | null
          notes?: string | null
          payment_terms?: string | null
          product_specifications?: Json | null
          quantity_available?: number | null
          response_date?: string | null
          response_status?: string
          sample_available?: boolean | null
          supplier_id?: string
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
          valid_until?: string | null
          warranty_period_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_responses_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "product_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_responses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_support_offerings: {
        Row: {
          benefits: string[] | null
          created_at: string
          id: string
          is_active: boolean | null
          requirements: string[] | null
          support_description: string | null
          support_name: string
          support_type: string
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          requirements?: string[] | null
          support_description?: string | null
          support_name: string
          support_type: string
        }
        Update: {
          benefits?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          requirements?: string[] | null
          support_description?: string | null
          support_name?: string
          support_type?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          business_license: string | null
          certification_ce: boolean | null
          certification_fcc: boolean | null
          certification_iso: string | null
          city: string | null
          company_name: string
          company_name_en: string | null
          contact_person: string
          country: string | null
          created_at: string
          created_by: string | null
          delivery_time_days: number | null
          email: string
          id: string
          is_active: boolean | null
          minimum_order_quantity: number | null
          notes: string | null
          payment_terms: string | null
          phone: string | null
          price_competitiveness: number | null
          product_categories: string[] | null
          province: string | null
          quality_score: number | null
          reliability_score: number | null
          response_time_hours: number | null
          specializations: string[] | null
          successful_orders: number | null
          supplier_grade: string
          total_orders: number | null
          updated_at: string
          user_id: string | null
          wechat: string | null
        }
        Insert: {
          address?: string | null
          business_license?: string | null
          certification_ce?: boolean | null
          certification_fcc?: boolean | null
          certification_iso?: string | null
          city?: string | null
          company_name: string
          company_name_en?: string | null
          contact_person: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          delivery_time_days?: number | null
          email: string
          id?: string
          is_active?: boolean | null
          minimum_order_quantity?: number | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          price_competitiveness?: number | null
          product_categories?: string[] | null
          province?: string | null
          quality_score?: number | null
          reliability_score?: number | null
          response_time_hours?: number | null
          specializations?: string[] | null
          successful_orders?: number | null
          supplier_grade?: string
          total_orders?: number | null
          updated_at?: string
          user_id?: string | null
          wechat?: string | null
        }
        Update: {
          address?: string | null
          business_license?: string | null
          certification_ce?: boolean | null
          certification_fcc?: boolean | null
          certification_iso?: string | null
          city?: string | null
          company_name?: string
          company_name_en?: string | null
          contact_person?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          delivery_time_days?: number | null
          email?: string
          id?: string
          is_active?: boolean | null
          minimum_order_quantity?: number | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          price_competitiveness?: number | null
          product_categories?: string[] | null
          province?: string | null
          quality_score?: number | null
          reliability_score?: number | null
          response_time_hours?: number | null
          specializations?: string[] | null
          successful_orders?: number | null
          supplier_grade?: string
          total_orders?: number | null
          updated_at?: string
          user_id?: string | null
          wechat?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          payload: Json | null
          record_id: string
          source_system: string
          sync_status: string
          table_name: string
          target_system: string
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json | null
          record_id: string
          source_system: string
          sync_status?: string
          table_name: string
          target_system: string
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json | null
          record_id?: string
          source_system?: string
          sync_status?: string
          table_name?: string
          target_system?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tax_invoice_items: {
        Row: {
          created_at: string
          description: string | null
          discount_amount: number
          discount_type: string
          id: string
          is_software: boolean
          line_total: number
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          tax_invoice_id: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_amount?: number
          discount_type?: string
          id?: string
          is_software?: boolean
          line_total?: number
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity?: number
          tax_invoice_id?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_amount?: number
          discount_type?: string
          id?: string
          is_software?: boolean
          line_total?: number
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          tax_invoice_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "tax_invoice_items_tax_invoice_id_fkey"
            columns: ["tax_invoice_id"]
            isOneToOne: false
            referencedRelation: "tax_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_invoices: {
        Row: {
          created_at: string
          created_by: string | null
          customer_address: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          discount_amount: number
          discount_percentage: number
          due_date: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_terms: string | null
          po_number: string | null
          project_name: string | null
          status: string
          subtotal: number
          tax_invoice_date: string
          tax_invoice_number: string
          terms_conditions: string | null
          total_amount: number
          updated_at: string
          vat_amount: number
          withholding_tax_amount: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number
          discount_percentage?: number
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_terms?: string | null
          po_number?: string | null
          project_name?: string | null
          status?: string
          subtotal?: number
          tax_invoice_date?: string
          tax_invoice_number: string
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          withholding_tax_amount?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number
          discount_percentage?: number
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_terms?: string | null
          po_number?: string | null
          project_name?: string | null
          status?: string
          subtotal?: number
          tax_invoice_date?: string
          tax_invoice_number?: string
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          withholding_tax_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "tax_invoices_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          created_at: string
          current_workload: number | null
          email: string | null
          id: string
          is_available: boolean | null
          name: string
          phone: string | null
          rating: number | null
          specialization:
            | Database["public"]["Enums"]["tech_specialization"]
            | null
          total_jobs: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_workload?: number | null
          email?: string | null
          id?: string
          is_available?: boolean | null
          name: string
          phone?: string | null
          rating?: number | null
          specialization?:
            | Database["public"]["Enums"]["tech_specialization"]
            | null
          total_jobs?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_workload?: number | null
          email?: string | null
          id?: string
          is_available?: boolean | null
          name?: string
          phone?: string | null
          rating?: number | null
          specialization?:
            | Database["public"]["Enums"]["tech_specialization"]
            | null
          total_jobs?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warranty_claims: {
        Row: {
          claim_date: string
          claim_number: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          problem_description: string
          processed_by: string | null
          replacement_delivery_id: string | null
          resolution: string | null
          status: string
          updated_at: string
          warranty_id: string
        }
        Insert: {
          claim_date?: string
          claim_number: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          problem_description: string
          processed_by?: string | null
          replacement_delivery_id?: string | null
          resolution?: string | null
          status?: string
          updated_at?: string
          warranty_id: string
        }
        Update: {
          claim_date?: string
          claim_number?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          problem_description?: string
          processed_by?: string | null
          replacement_delivery_id?: string | null
          resolution?: string | null
          status?: string
          updated_at?: string
          warranty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranty_claims_replacement_delivery_id_fkey"
            columns: ["replacement_delivery_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_claims_warranty_id_fkey"
            columns: ["warranty_id"]
            isOneToOne: false
            referencedRelation: "product_warranties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      key_account_performance: {
        Row: {
          annual_revenue_target: number | null
          calls_actual: number | null
          calls_target: number | null
          contact_frequency_met: boolean | null
          contact_status: string | null
          customer_id: string | null
          customer_name: string | null
          days_since_last_contact: number | null
          key_account_tier: string | null
          key_account_weight: number | null
          last_contact_date: string | null
          meetings_achievement_percent: number | null
          meetings_actual: number | null
          meetings_target: number | null
          minimum_contact_frequency: number | null
          next_required_contact: string | null
          revenue_achievement_percent: number | null
          revenue_actual: number | null
          revenue_target: number | null
          sales_person_id: string | null
        }
        Relationships: []
      }
      supplier_summary: {
        Row: {
          bank_account: string | null
          bank_name: string | null
          banking_swift_code: string | null
          compliance_status: string | null
          contact_email_finance: string | null
          contact_person: string | null
          contact_person_finance: string | null
          created_at: string | null
          delivery_rating: number | null
          email: string | null
          id: string | null
          is_preferred_supplier: boolean | null
          last_order_date: string | null
          name: string | null
          phone: string | null
          price_rating: number | null
          quality_rating: number | null
          recent_transfer_amount: number | null
          recent_transfer_count: number | null
          supplier_category: string | null
          supplier_code: string | null
          supplier_country: string | null
          supplier_currency: string | null
          total_orders_count: number | null
          total_orders_value: number | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invitation: {
        Args: { invitation_token: string }
        Returns: Json
      }
      auto_assign_staff: {
        Args: { delivery_order_id: string }
        Returns: string
      }
      auto_assign_technician: {
        Args: { request_id: string }
        Returns: string
      }
      award_purchase_points: {
        Args: {
          customer_uuid: string
          purchase_amount: number
          reference_id_param?: string
        }
        Returns: number
      }
      calculate_loyalty_tier: {
        Args: { annual_spent: number }
        Returns: string
      }
      calculate_tiered_commission: {
        Args: { monthly_target?: number; sales_amount: number }
        Returns: number
      }
      can_issue_receipt_for_tax_invoice: {
        Args: { tax_invoice_id_param: string }
        Returns: boolean
      }
      can_manage_customers: {
        Args: { _user_id: string }
        Returns: boolean
      }
      can_manage_inventory: {
        Args: { _user_id: string }
        Returns: boolean
      }
      check_repeat_customer: {
        Args: { customer_id_param: string }
        Returns: boolean
      }
      complete_key_account_transfer: {
        Args: { request_id: string }
        Returns: boolean
      }
      create_activity_notification: {
        Args: {
          p_activity_id: string
          p_message: string
          p_opportunity_id: string
          p_priority?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_opportunity_notification: {
        Args: {
          p_message: string
          p_opportunity_id: string
          p_priority?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      generate_claim_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_delivery_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_inquiry_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_payment_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_quotation_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_repair_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_tax_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_transfer_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_key_account_performance_for_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          annual_revenue_target: number
          calls_actual: number
          calls_target: number
          contact_frequency_met: boolean
          contact_status: string
          customer_id: string
          customer_name: string
          days_since_last_contact: number
          key_account_tier: string
          key_account_weight: number
          last_contact_date: string
          meetings_achievement_percent: number
          meetings_actual: number
          meetings_target: number
          minimum_contact_frequency: number
          next_required_contact: string
          recent_activities_count: number
          revenue_achievement_percent: number
          revenue_actual: number
          revenue_target: number
          sales_person_id: string
        }[]
      }
      get_orphaned_key_accounts: {
        Args: Record<PropertyKey, never>
        Returns: {
          annual_revenue_target: number
          customer_id: string
          customer_name: string
          days_without_contact: number
          key_account_tier: string
          key_account_weight: number
          last_contact_date: string
          last_sales_person_name: string
        }[]
      }
      get_recent_key_account_activities_count: {
        Args: { customer_id_param: string }
        Returns: number
      }
      get_team_sales_performance: {
        Args: { target_month?: number; target_year?: number }
        Returns: {
          achievement_percent: number
          closing_rate: number
          commission_amount: number
          conversion_rate: number
          invoices_paid: number
          monthly_target: number
          period_month: number
          period_year: number
          quotations_approved: number
          quotations_created: number
          quotations_value: number
          receipts_value: number
          sales_person_email: string
          sales_person_id: string
          sales_person_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      link_receipt_to_quotation: {
        Args: { quotation_number_param: string; receipt_uuid: string }
        Returns: boolean
      }
      log_user_action: {
        Args: {
          action_name: string
          details_param?: Json
          resource_id_param?: string
          resource_type_param: string
        }
        Returns: string
      }
      mark_all_notifications_read: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      mark_notification_read: {
        Args: { notification_id: string }
        Returns: boolean
      }
      recalculate_sales_metrics: {
        Args: {
          sales_person_uuid: string
          target_month: number
          target_year: number
        }
        Returns: undefined
      }
      redeem_loyalty_points: {
        Args: {
          customer_uuid: string
          processed_by_param: string
          reward_uuid: string
        }
        Returns: string
      }
    }
    Enums: {
      activity_type:
        | "call"
        | "email"
        | "meeting"
        | "task"
        | "note"
        | "follow_up"
      app_role: "admin" | "accountant" | "user" | "sales"
      priority_level: "low" | "medium" | "high" | "urgent"
      process_type: "standard" | "downpayment" | "conversion" | "purchase_order"
      quotation_status:
        | "draft"
        | "wait_for_approve"
        | "approved"
        | "rejected"
        | "invoice_created"
        | "downpayment_invoice"
        | "conversion_invoice"
        | "purchase_order_created"
        | "completed"
        | "delivery_note_created"
        | "tax_invoice_created"
        | "cash_receipt_created"
        | "split_payment_invoice"
        | "split_payment_delivery"
        | "split_payment_receipt"
        | "downpayment_delivery"
        | "downpayment_receipt"
      service_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "waiting_parts"
        | "completed"
        | "cancelled"
      tech_specialization:
        | "general"
        | "electrical"
        | "mechanical"
        | "software"
        | "hardware"
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
      activity_type: ["call", "email", "meeting", "task", "note", "follow_up"],
      app_role: ["admin", "accountant", "user", "sales"],
      priority_level: ["low", "medium", "high", "urgent"],
      process_type: ["standard", "downpayment", "conversion", "purchase_order"],
      quotation_status: [
        "draft",
        "wait_for_approve",
        "approved",
        "rejected",
        "invoice_created",
        "downpayment_invoice",
        "conversion_invoice",
        "purchase_order_created",
        "completed",
        "delivery_note_created",
        "tax_invoice_created",
        "cash_receipt_created",
        "split_payment_invoice",
        "split_payment_delivery",
        "split_payment_receipt",
        "downpayment_delivery",
        "downpayment_receipt",
      ],
      service_status: [
        "pending",
        "assigned",
        "in_progress",
        "waiting_parts",
        "completed",
        "cancelled",
      ],
      tech_specialization: [
        "general",
        "electrical",
        "mechanical",
        "software",
        "hardware",
      ],
    },
  },
} as const
