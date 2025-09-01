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
      customers: {
        Row: {
          address: string | null
          bank_account: string | null
          bank_address: string | null
          bank_branch: string | null
          bank_name: string | null
          citizen_id: string | null
          contact_person: string | null
          contact_position: string | null
          contact_type: string | null
          created_at: string
          created_by: string | null
          customer_type: string
          district: string | null
          email: string | null
          facebook: string | null
          hq_branch: string | null
          id: string
          line_id: string | null
          name: string
          notes: string | null
          person_type: string | null
          phone: string | null
          postal_code: string | null
          province: string | null
          status: string | null
          sub_district: string | null
          swift_code: string | null
          tax_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bank_address?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          citizen_id?: string | null
          contact_person?: string | null
          contact_position?: string | null
          contact_type?: string | null
          created_at?: string
          created_by?: string | null
          customer_type?: string
          district?: string | null
          email?: string | null
          facebook?: string | null
          hq_branch?: string | null
          id?: string
          line_id?: string | null
          name: string
          notes?: string | null
          person_type?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          status?: string | null
          sub_district?: string | null
          swift_code?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bank_address?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          citizen_id?: string | null
          contact_person?: string | null
          contact_position?: string | null
          contact_type?: string | null
          created_at?: string
          created_by?: string | null
          customer_type?: string
          district?: string | null
          email?: string | null
          facebook?: string | null
          hq_branch?: string | null
          id?: string
          line_id?: string | null
          name?: string
          notes?: string | null
          person_type?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          status?: string | null
          sub_district?: string | null
          swift_code?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
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
          category: string | null
          created_at: string
          description: string | null
          id: string
          item_condition: string | null
          name: string
          price: number
          repair_notes: string | null
          repair_order_id: string | null
          repaired_date: string | null
          service_request_id: string | null
          sku: string
          status: string
          stock: number
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          item_condition?: string | null
          name: string
          price?: number
          repair_notes?: string | null
          repair_order_id?: string | null
          repaired_date?: string | null
          service_request_id?: string | null
          sku: string
          status?: string
          stock?: number
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          item_condition?: string | null
          name?: string
          price?: number
          repair_notes?: string | null
          repair_order_id?: string | null
          repaired_date?: string | null
          service_request_id?: string | null
          sku?: string
          status?: string
          stock?: number
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
      quotations: {
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
          id: string
          notes: string | null
          quotation_date: string
          quotation_number: string
          status: string
          subtotal: number
          terms_conditions: string | null
          total_amount: number
          updated_at: string
          valid_until: string | null
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
          id?: string
          notes?: string | null
          quotation_date?: string
          quotation_number: string
          status?: string
          subtotal?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
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
          id?: string
          notes?: string | null
          quotation_date?: string
          quotation_number?: string
          status?: string
          subtotal?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
          withholding_tax_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
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
          service_request_id: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["service_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["service_status"] | null
          service_request_id?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["service_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["service_status"] | null
          service_request_id?: string | null
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
      [_ in never]: never
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
      can_manage_inventory: {
        Args: { _user_id: string }
        Returns: boolean
      }
      generate_claim_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_delivery_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_quotation_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_repair_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      log_user_action: {
        Args: {
          action_name: string
          details_param?: Json
          resource_id_param?: string
          resource_type_param: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "accountant" | "user" | "sales"
      priority_level: "low" | "medium" | "high" | "urgent"
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
      app_role: ["admin", "accountant", "user", "sales"],
      priority_level: ["low", "medium", "high", "urgent"],
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
