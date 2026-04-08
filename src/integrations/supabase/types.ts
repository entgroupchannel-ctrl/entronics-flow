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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
          {
            foreignKeyName: "activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities_secure"
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      base_products: {
        Row: {
          base_price: number
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          form_factor: string | null
          gallery_images: string[] | null
          id: string
          image_alt_text: string | null
          is_active: boolean
          main_image_url: string | null
          product_code: string
          product_name: string
          series: string | null
          updated_at: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          form_factor?: string | null
          gallery_images?: string[] | null
          id?: string
          image_alt_text?: string | null
          is_active?: boolean
          main_image_url?: string | null
          product_code: string
          product_name: string
          series?: string | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          form_factor?: string | null
          gallery_images?: string[] | null
          id?: string
          image_alt_text?: string | null
          is_active?: boolean
          main_image_url?: string | null
          product_code?: string
          product_name?: string
          series?: string | null
          updated_at?: string
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
      companies: {
        Row: {
          address: string | null
          annual_revenue: number | null
          business_registration_number: string | null
          business_type: string | null
          company_name: string
          company_size: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          established_year: number | null
          id: string
          industry_sector: string | null
          is_active: boolean | null
          number_of_employees: number | null
          phone: string | null
          postal_code: string | null
          province: string | null
          tax_id: string
          updated_at: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          annual_revenue?: number | null
          business_registration_number?: string | null
          business_type?: string | null
          company_name: string
          company_size?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          established_year?: number | null
          id?: string
          industry_sector?: string | null
          is_active?: boolean | null
          number_of_employees?: number | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          tax_id: string
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          annual_revenue?: number | null
          business_registration_number?: string | null
          business_type?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          established_year?: number | null
          id?: string
          industry_sector?: string | null
          is_active?: boolean | null
          number_of_employees?: number | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          tax_id?: string
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_credit_profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          auto_approve_limit: number | null
          auto_approve_orders: boolean | null
          available_credit: number
          company_id: string
          created_at: string | null
          created_by: string | null
          credit_grade: string | null
          credit_limit: number
          credit_score: number | null
          credit_status: string
          id: string
          interest_rate: number | null
          last_payment_date: string | null
          last_review_date: string | null
          next_payment_due: string | null
          next_review_date: string | null
          overdue_amount: number | null
          payment_terms_days: number
          risk_level: string | null
          updated_at: string | null
          used_credit: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          auto_approve_limit?: number | null
          auto_approve_orders?: boolean | null
          available_credit?: number
          company_id: string
          created_at?: string | null
          created_by?: string | null
          credit_grade?: string | null
          credit_limit?: number
          credit_score?: number | null
          credit_status?: string
          id?: string
          interest_rate?: number | null
          last_payment_date?: string | null
          last_review_date?: string | null
          next_payment_due?: string | null
          next_review_date?: string | null
          overdue_amount?: number | null
          payment_terms_days?: number
          risk_level?: string | null
          updated_at?: string | null
          used_credit?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          auto_approve_limit?: number | null
          auto_approve_orders?: boolean | null
          available_credit?: number
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          credit_grade?: string | null
          credit_limit?: number
          credit_score?: number | null
          credit_status?: string
          id?: string
          interest_rate?: number | null
          last_payment_date?: string | null
          last_review_date?: string | null
          next_payment_due?: string | null
          next_review_date?: string | null
          overdue_amount?: number | null
          payment_terms_days?: number
          risk_level?: string | null
          updated_at?: string | null
          used_credit?: number
        }
        Relationships: [
          {
            foreignKeyName: "company_credit_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      component_dependencies: {
        Row: {
          allowed_values: Json
          base_product_id: string | null
          created_at: string
          dependent_component_type: string
          id: string
          parent_component_type: string
          parent_component_value: string
          restriction_type: string
          updated_at: string
        }
        Insert: {
          allowed_values?: Json
          base_product_id?: string | null
          created_at?: string
          dependent_component_type: string
          id?: string
          parent_component_type: string
          parent_component_value: string
          restriction_type?: string
          updated_at?: string
        }
        Update: {
          allowed_values?: Json
          base_product_id?: string | null
          created_at?: string
          dependent_component_type?: string
          id?: string
          parent_component_type?: string
          parent_component_value?: string
          restriction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "component_dependencies_base_product_id_fkey"
            columns: ["base_product_id"]
            isOneToOne: false
            referencedRelation: "base_products"
            referencedColumns: ["id"]
          },
        ]
      }
      configuration_pricing_rules: {
        Row: {
          base_product_id: string | null
          component_group: string | null
          component_type: string
          component_value: string
          created_at: string
          currency: string
          dependency_rules: Json | null
          display_order: number | null
          id: string
          is_active: boolean
          is_percentage: boolean | null
          price_adjustment: number
          updated_at: string
        }
        Insert: {
          base_product_id?: string | null
          component_group?: string | null
          component_type: string
          component_value: string
          created_at?: string
          currency?: string
          dependency_rules?: Json | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          is_percentage?: boolean | null
          price_adjustment?: number
          updated_at?: string
        }
        Update: {
          base_product_id?: string | null
          component_group?: string | null
          component_type?: string
          component_value?: string
          created_at?: string
          currency?: string
          dependency_rules?: Json | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          is_percentage?: boolean | null
          price_adjustment?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuration_pricing_rules_base_product_id_fkey"
            columns: ["base_product_id"]
            isOneToOne: false
            referencedRelation: "base_products"
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
      credit_application_documents: {
        Row: {
          created_at: string
          credit_application_id: string
          document_name: string
          document_type: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_verified: boolean | null
          notes: string | null
          updated_at: string
          upload_date: string
          uploaded_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          credit_application_id: string
          document_name: string
          document_type: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          updated_at?: string
          upload_date?: string
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          credit_application_id?: string
          document_name?: string
          document_type?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          updated_at?: string
          upload_date?: string
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_credit_application"
            columns: ["credit_application_id"]
            isOneToOne: false
            referencedRelation: "credit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_applications: {
        Row: {
          additional_document_requirements: string | null
          additional_documents: Json | null
          annual_revenue: number | null
          application_number: string
          application_status: string
          applied_at: string
          applied_by: string | null
          approved_at: string | null
          approved_by: string | null
          approved_credit_limit: number | null
          bank_account_number: string | null
          bank_name: string | null
          business_license_url: string | null
          business_registration_number: string | null
          business_type: string | null
          company_name: string
          conditions: string | null
          contract_details: string | null
          created_at: string
          credit_score: number | null
          credit_score_details: Json | null
          customer_id: string | null
          customer_response: string | null
          customer_response_date: string | null
          customer_response_notes: string | null
          document_request_notes: string | null
          financial_statements_url: string | null
          id: string
          industry_sector: string | null
          interest_rate: number | null
          notes: string | null
          number_of_employees: number | null
          payment_terms_days: number | null
          reference_contacts: Json | null
          rejection_reason: string | null
          requested_credit_limit: number
          required_documents: string | null
          requires_additional_documents: boolean | null
          requires_admin_verification: boolean | null
          requires_contract_signing: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          starter_package_details: string | null
          tax_id: string | null
          trial_conditions: string | null
          trial_period_days: number | null
          updated_at: string
          uploaded_response_documents: string[] | null
          verification_notes: string | null
          years_in_business: number | null
        }
        Insert: {
          additional_document_requirements?: string | null
          additional_documents?: Json | null
          annual_revenue?: number | null
          application_number: string
          application_status?: string
          applied_at?: string
          applied_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_credit_limit?: number | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_license_url?: string | null
          business_registration_number?: string | null
          business_type?: string | null
          company_name: string
          conditions?: string | null
          contract_details?: string | null
          created_at?: string
          credit_score?: number | null
          credit_score_details?: Json | null
          customer_id?: string | null
          customer_response?: string | null
          customer_response_date?: string | null
          customer_response_notes?: string | null
          document_request_notes?: string | null
          financial_statements_url?: string | null
          id?: string
          industry_sector?: string | null
          interest_rate?: number | null
          notes?: string | null
          number_of_employees?: number | null
          payment_terms_days?: number | null
          reference_contacts?: Json | null
          rejection_reason?: string | null
          requested_credit_limit: number
          required_documents?: string | null
          requires_additional_documents?: boolean | null
          requires_admin_verification?: boolean | null
          requires_contract_signing?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          starter_package_details?: string | null
          tax_id?: string | null
          trial_conditions?: string | null
          trial_period_days?: number | null
          updated_at?: string
          uploaded_response_documents?: string[] | null
          verification_notes?: string | null
          years_in_business?: number | null
        }
        Update: {
          additional_document_requirements?: string | null
          additional_documents?: Json | null
          annual_revenue?: number | null
          application_number?: string
          application_status?: string
          applied_at?: string
          applied_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_credit_limit?: number | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_license_url?: string | null
          business_registration_number?: string | null
          business_type?: string | null
          company_name?: string
          conditions?: string | null
          contract_details?: string | null
          created_at?: string
          credit_score?: number | null
          credit_score_details?: Json | null
          customer_id?: string | null
          customer_response?: string | null
          customer_response_date?: string | null
          customer_response_notes?: string | null
          document_request_notes?: string | null
          financial_statements_url?: string | null
          id?: string
          industry_sector?: string | null
          interest_rate?: number | null
          notes?: string | null
          number_of_employees?: number | null
          payment_terms_days?: number | null
          reference_contacts?: Json | null
          rejection_reason?: string | null
          requested_credit_limit?: number
          required_documents?: string | null
          requires_additional_documents?: boolean | null
          requires_admin_verification?: boolean | null
          requires_contract_signing?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          starter_package_details?: string | null
          tax_id?: string | null
          trial_conditions?: string | null
          trial_period_days?: number | null
          updated_at?: string
          uploaded_response_documents?: string[] | null
          verification_notes?: string | null
          years_in_business?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_applications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_applications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers_with_field_security"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_applications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "credit_applications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "secure_key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "credit_applications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_order_items: {
        Row: {
          created_at: string
          credit_order_id: string
          discount_amount: number | null
          id: string
          item_notes: string | null
          line_total: number
          product_id: string | null
          product_model: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          credit_order_id: string
          discount_amount?: number | null
          id?: string
          item_notes?: string | null
          line_total: number
          product_id?: string | null
          product_model?: string | null
          product_name: string
          product_sku?: string | null
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          credit_order_id?: string
          discount_amount?: number | null
          id?: string
          item_notes?: string | null
          line_total?: number
          product_id?: string | null
          product_model?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "credit_order_items_credit_order_id_fkey"
            columns: ["credit_order_id"]
            isOneToOne: false
            referencedRelation: "credit_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_order_tracking: {
        Row: {
          created_at: string
          credit_order_id: string
          id: string
          location: string | null
          previous_status: string | null
          status: string
          status_date: string
          status_message: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          credit_order_id: string
          id?: string
          location?: string | null
          previous_status?: string | null
          status: string
          status_date?: string
          status_message: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          credit_order_id?: string
          id?: string
          location?: string | null
          previous_status?: string | null
          status?: string
          status_date?: string
          status_message?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_order_tracking_credit_order_id_fkey"
            columns: ["credit_order_id"]
            isOneToOne: false
            referencedRelation: "credit_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_orders: {
        Row: {
          approved_by: string | null
          approved_date: string | null
          created_at: string
          created_by: string | null
          credit_used: number
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          delivery_date: string | null
          estimated_delivery: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          order_date: string
          order_number: string
          priority: string
          remaining_credit_after: number | null
          shipped_date: string | null
          shipping_address: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string
          created_by?: string | null
          credit_used?: number
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          delivery_date?: string | null
          estimated_delivery?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_date?: string
          order_number: string
          priority?: string
          remaining_credit_after?: number | null
          shipped_date?: string | null
          shipping_address: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string
          created_by?: string | null
          credit_used?: number
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_date?: string | null
          estimated_delivery?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_date?: string
          order_number?: string
          priority?: string
          remaining_credit_after?: number | null
          shipped_date?: string | null
          shipping_address?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers_with_field_security"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "credit_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "secure_key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "credit_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_review_workflow: {
        Row: {
          admin_review_date: string | null
          admin_review_notes: string | null
          admin_review_status: string | null
          admin_reviewed_by: string | null
          cash_flow_score: number | null
          completed_at: string | null
          conditions: string | null
          created_at: string
          credit_application_id: string
          current_stage: string
          debt_ratio_score: number | null
          document_completeness_score: number | null
          document_quality_score: number | null
          escalation_reason: string | null
          final_approved_limit: number | null
          final_terms_days: number | null
          finance_recommendation: string | null
          finance_staff_notes: string | null
          finance_staff_review_date: string | null
          finance_staff_reviewed_by: string | null
          finance_staff_status: string | null
          id: string
          industry_risk_score: number | null
          manager_decided_by: string | null
          manager_decision: string | null
          manager_decision_date: string | null
          manager_decision_status: string | null
          manager_notes: string | null
          payment_history_score: number | null
          priority_level: string | null
          profitability_score: number | null
          recommended_limit: number | null
          recommended_terms_days: number | null
          revenue_score: number | null
          risk_level: string | null
          stage_history: Json | null
          total_financial_score: number | null
          updated_at: string
          workflow_status: string
        }
        Insert: {
          admin_review_date?: string | null
          admin_review_notes?: string | null
          admin_review_status?: string | null
          admin_reviewed_by?: string | null
          cash_flow_score?: number | null
          completed_at?: string | null
          conditions?: string | null
          created_at?: string
          credit_application_id: string
          current_stage?: string
          debt_ratio_score?: number | null
          document_completeness_score?: number | null
          document_quality_score?: number | null
          escalation_reason?: string | null
          final_approved_limit?: number | null
          final_terms_days?: number | null
          finance_recommendation?: string | null
          finance_staff_notes?: string | null
          finance_staff_review_date?: string | null
          finance_staff_reviewed_by?: string | null
          finance_staff_status?: string | null
          id?: string
          industry_risk_score?: number | null
          manager_decided_by?: string | null
          manager_decision?: string | null
          manager_decision_date?: string | null
          manager_decision_status?: string | null
          manager_notes?: string | null
          payment_history_score?: number | null
          priority_level?: string | null
          profitability_score?: number | null
          recommended_limit?: number | null
          recommended_terms_days?: number | null
          revenue_score?: number | null
          risk_level?: string | null
          stage_history?: Json | null
          total_financial_score?: number | null
          updated_at?: string
          workflow_status?: string
        }
        Update: {
          admin_review_date?: string | null
          admin_review_notes?: string | null
          admin_review_status?: string | null
          admin_reviewed_by?: string | null
          cash_flow_score?: number | null
          completed_at?: string | null
          conditions?: string | null
          created_at?: string
          credit_application_id?: string
          current_stage?: string
          debt_ratio_score?: number | null
          document_completeness_score?: number | null
          document_quality_score?: number | null
          escalation_reason?: string | null
          final_approved_limit?: number | null
          final_terms_days?: number | null
          finance_recommendation?: string | null
          finance_staff_notes?: string | null
          finance_staff_review_date?: string | null
          finance_staff_reviewed_by?: string | null
          finance_staff_status?: string | null
          id?: string
          industry_risk_score?: number | null
          manager_decided_by?: string | null
          manager_decision?: string | null
          manager_decision_date?: string | null
          manager_decision_status?: string | null
          manager_notes?: string | null
          payment_history_score?: number | null
          priority_level?: string | null
          profitability_score?: number | null
          recommended_limit?: number | null
          recommended_terms_days?: number | null
          revenue_score?: number | null
          risk_level?: string | null
          stage_history?: Json | null
          total_financial_score?: number | null
          updated_at?: string
          workflow_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_review_workflow_credit_application_id_fkey"
            columns: ["credit_application_id"]
            isOneToOne: false
            referencedRelation: "credit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_scoring_rules: {
        Row: {
          condition_operator: string
          condition_value: Json
          created_at: string
          id: string
          is_active: boolean
          rule_name: string
          rule_type: string
          score_points: number
          updated_at: string
          weight_percentage: number | null
        }
        Insert: {
          condition_operator: string
          condition_value: Json
          created_at?: string
          id?: string
          is_active?: boolean
          rule_name: string
          rule_type: string
          score_points: number
          updated_at?: string
          weight_percentage?: number | null
        }
        Update: {
          condition_operator?: string
          condition_value?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          rule_name?: string
          rule_type?: string
          score_points?: number
          updated_at?: string
          weight_percentage?: number | null
        }
        Relationships: []
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
      customer_quote_items: {
        Row: {
          created_at: string
          discount_percent: number | null
          id: string
          line_total: number
          product_data: Json | null
          product_name: string
          product_sku: string | null
          quantity: number
          quote_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount_percent?: number | null
          id?: string
          line_total?: number
          product_data?: Json | null
          product_name: string
          product_sku?: string | null
          quantity?: number
          quote_id: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          discount_percent?: number | null
          id?: string
          line_total?: number
          product_data?: Json | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          quote_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "customer_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_quotes: {
        Row: {
          company: string | null
          created_at: string
          customer_name: string | null
          discount_amount: number | null
          email: string | null
          expiry_date: string | null
          id: string
          is_converted_to_order: boolean | null
          is_converted_to_rfq: boolean | null
          line_id: string | null
          net_amount: number | null
          notes: string | null
          order_id: string | null
          phone: string | null
          project_name: string | null
          quote_data: Json
          quote_number: string
          rfq_id: string | null
          status: string
          subtotal: number | null
          total_amount: number | null
          updated_at: string
          user_id: string | null
          vat_amount: number | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          customer_name?: string | null
          discount_amount?: number | null
          email?: string | null
          expiry_date?: string | null
          id?: string
          is_converted_to_order?: boolean | null
          is_converted_to_rfq?: boolean | null
          line_id?: string | null
          net_amount?: number | null
          notes?: string | null
          order_id?: string | null
          phone?: string | null
          project_name?: string | null
          quote_data?: Json
          quote_number: string
          rfq_id?: string | null
          status?: string
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
          vat_amount?: number | null
        }
        Update: {
          company?: string | null
          created_at?: string
          customer_name?: string | null
          discount_amount?: number | null
          email?: string | null
          expiry_date?: string | null
          id?: string
          is_converted_to_order?: boolean | null
          is_converted_to_rfq?: boolean | null
          line_id?: string | null
          net_amount?: number | null
          notes?: string | null
          order_id?: string | null
          phone?: string | null
          project_name?: string | null
          quote_data?: Json
          quote_number?: string
          rfq_id?: string | null
          status?: string
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
          vat_amount?: number | null
        }
        Relationships: []
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
          business_registration_number: string | null
          business_type: string | null
          can_approve_orders: boolean | null
          certifications: string[] | null
          citizen_id: string | null
          company_id: string | null
          compliance_status: string | null
          contact_email_finance: string | null
          contact_person: string | null
          contact_person_finance: string | null
          contact_phone_finance: string | null
          contact_position: string | null
          contact_type: string | null
          created_at: string
          created_by: string
          credit_limit: number | null
          customer_type: string
          delivery_rating: number | null
          district: string | null
          email: string | null
          employee_position: string | null
          established_year: number | null
          facebook: string | null
          hq_branch: string | null
          id: string
          is_archived: boolean | null
          is_company_admin: boolean | null
          is_key_account: boolean | null
          is_preferred_supplier: boolean | null
          key_account_designated_at: string | null
          key_account_designated_by: string | null
          key_account_notes: string | null
          key_account_removal_reason: string | null
          key_account_removed_at: string | null
          key_account_removed_by: string | null
          key_account_tier: string | null
          key_account_weight: number | null
          last_contact_date: string | null
          last_order_date: string | null
          last_synced_at: string | null
          line_id: string | null
          main_products: string[] | null
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
          reference_contacts: Json | null
          source_system: string | null
          status: string | null
          sub_district: string | null
          supplier_application_date: string | null
          supplier_approved_by: string | null
          supplier_approved_date: string | null
          supplier_category: string | null
          supplier_code: string | null
          supplier_country: string | null
          supplier_currency: string | null
          supplier_notes: string | null
          supplier_registration_status: string | null
          supplier_rejection_reason: string | null
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
          business_registration_number?: string | null
          business_type?: string | null
          can_approve_orders?: boolean | null
          certifications?: string[] | null
          citizen_id?: string | null
          company_id?: string | null
          compliance_status?: string | null
          contact_email_finance?: string | null
          contact_person?: string | null
          contact_person_finance?: string | null
          contact_phone_finance?: string | null
          contact_position?: string | null
          contact_type?: string | null
          created_at?: string
          created_by: string
          credit_limit?: number | null
          customer_type?: string
          delivery_rating?: number | null
          district?: string | null
          email?: string | null
          employee_position?: string | null
          established_year?: number | null
          facebook?: string | null
          hq_branch?: string | null
          id?: string
          is_archived?: boolean | null
          is_company_admin?: boolean | null
          is_key_account?: boolean | null
          is_preferred_supplier?: boolean | null
          key_account_designated_at?: string | null
          key_account_designated_by?: string | null
          key_account_notes?: string | null
          key_account_removal_reason?: string | null
          key_account_removed_at?: string | null
          key_account_removed_by?: string | null
          key_account_tier?: string | null
          key_account_weight?: number | null
          last_contact_date?: string | null
          last_order_date?: string | null
          last_synced_at?: string | null
          line_id?: string | null
          main_products?: string[] | null
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
          reference_contacts?: Json | null
          source_system?: string | null
          status?: string | null
          sub_district?: string | null
          supplier_application_date?: string | null
          supplier_approved_by?: string | null
          supplier_approved_date?: string | null
          supplier_category?: string | null
          supplier_code?: string | null
          supplier_country?: string | null
          supplier_currency?: string | null
          supplier_notes?: string | null
          supplier_registration_status?: string | null
          supplier_rejection_reason?: string | null
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
          business_registration_number?: string | null
          business_type?: string | null
          can_approve_orders?: boolean | null
          certifications?: string[] | null
          citizen_id?: string | null
          company_id?: string | null
          compliance_status?: string | null
          contact_email_finance?: string | null
          contact_person?: string | null
          contact_person_finance?: string | null
          contact_phone_finance?: string | null
          contact_position?: string | null
          contact_type?: string | null
          created_at?: string
          created_by?: string
          credit_limit?: number | null
          customer_type?: string
          delivery_rating?: number | null
          district?: string | null
          email?: string | null
          employee_position?: string | null
          established_year?: number | null
          facebook?: string | null
          hq_branch?: string | null
          id?: string
          is_archived?: boolean | null
          is_company_admin?: boolean | null
          is_key_account?: boolean | null
          is_preferred_supplier?: boolean | null
          key_account_designated_at?: string | null
          key_account_designated_by?: string | null
          key_account_notes?: string | null
          key_account_removal_reason?: string | null
          key_account_removed_at?: string | null
          key_account_removed_by?: string | null
          key_account_tier?: string | null
          key_account_weight?: number | null
          last_contact_date?: string | null
          last_order_date?: string | null
          last_synced_at?: string | null
          line_id?: string | null
          main_products?: string[] | null
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
          reference_contacts?: Json | null
          source_system?: string | null
          status?: string | null
          sub_district?: string | null
          supplier_application_date?: string | null
          supplier_approved_by?: string | null
          supplier_approved_date?: string | null
          supplier_category?: string | null
          supplier_code?: string | null
          supplier_country?: string | null
          supplier_currency?: string | null
          supplier_notes?: string | null
          supplier_registration_status?: string | null
          supplier_rejection_reason?: string | null
          swift_code?: string | null
          sync_status?: string | null
          tax_certificate_url?: string | null
          tax_id?: string | null
          total_orders_count?: number | null
          total_orders_value?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      datasheet_files: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          download_count: number | null
          file_path: string
          file_size: number | null
          file_type: string | null
          file_url: string
          folder_id: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          language: string | null
          name: string
          product_series: string | null
          tags: string[] | null
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          folder_id?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          language?: string | null
          name: string
          product_series?: string | null
          tags?: string[] | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          folder_id?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          language?: string | null
          name?: string
          product_series?: string | null
          tags?: string[] | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "datasheet_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "datasheet_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      datasheet_folders: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_folder_id: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_folder_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_folder_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "datasheet_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "datasheet_folders"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "delivery_orders_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "technicians_secure_info"
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
      employee_leave_balances: {
        Row: {
          annual_leave_total: number
          annual_leave_used: number
          created_at: string | null
          employee_id: string
          id: string
          maternity_leave_total: number
          maternity_leave_used: number
          personal_leave_total: number
          personal_leave_used: number
          sick_leave_total: number
          sick_leave_used: number
          special_leave_total: number
          special_leave_used: number
          updated_at: string | null
          year: number
        }
        Insert: {
          annual_leave_total?: number
          annual_leave_used?: number
          created_at?: string | null
          employee_id: string
          id?: string
          maternity_leave_total?: number
          maternity_leave_used?: number
          personal_leave_total?: number
          personal_leave_used?: number
          sick_leave_total?: number
          sick_leave_used?: number
          special_leave_total?: number
          special_leave_used?: number
          updated_at?: string | null
          year?: number
        }
        Update: {
          annual_leave_total?: number
          annual_leave_used?: number
          created_at?: string | null
          employee_id?: string
          id?: string
          maternity_leave_total?: number
          maternity_leave_used?: number
          personal_leave_total?: number
          personal_leave_used?: number
          sick_leave_total?: number
          sick_leave_used?: number
          special_leave_total?: number
          special_leave_used?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      employee_leave_requests: {
        Row: {
          created_at: string | null
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string
          requested_at: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: string
          total_days: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          end_date: string
          id?: string
          leave_type: string
          reason: string
          requested_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: string
          total_days: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string
          requested_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: string
          total_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_leave_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      financing_options: {
        Row: {
          created_at: string
          description: string | null
          discount_percentage: number | null
          display_order: number | null
          id: string
          interest_rate: number | null
          is_active: boolean
          maximum_amount: number | null
          minimum_amount: number | null
          option_code: string
          option_name: string
          payment_terms_days: number
          processing_fee: number | null
          requires_approval: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          id?: string
          interest_rate?: number | null
          is_active?: boolean
          maximum_amount?: number | null
          minimum_amount?: number | null
          option_code: string
          option_name: string
          payment_terms_days: number
          processing_fee?: number | null
          requires_approval?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          id?: string
          interest_rate?: number | null
          is_active?: boolean
          maximum_amount?: number | null
          minimum_amount?: number | null
          option_code?: string
          option_name?: string
          payment_terms_days?: number
          processing_fee?: number | null
          requires_approval?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      goal_activities: {
        Row: {
          activity_date: string
          activity_type: string
          created_at: string
          created_by: string | null
          description: string | null
          goal_id: string
          id: string
          title: string
          value_change: number | null
        }
        Insert: {
          activity_date?: string
          activity_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          goal_id: string
          id?: string
          title: string
          value_change?: number | null
        }
        Update: {
          activity_date?: string
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          goal_id?: string
          id?: string
          title?: string
          value_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_goal_activities_goal"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "key_account_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_opportunities: {
        Row: {
          actual_contribution: number | null
          contribution_weight: number | null
          expected_contribution: number | null
          goal_id: string
          id: string
          linked_at: string
          linked_by: string | null
          opportunity_id: string
        }
        Insert: {
          actual_contribution?: number | null
          contribution_weight?: number | null
          expected_contribution?: number | null
          goal_id: string
          id?: string
          linked_at?: string
          linked_by?: string | null
          opportunity_id: string
        }
        Update: {
          actual_contribution?: number | null
          contribution_weight?: number | null
          expected_contribution?: number | null
          goal_id?: string
          id?: string
          linked_at?: string
          linked_by?: string | null
          opportunity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_goal_opportunities_goal"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "key_account_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_goal_opportunities_opportunity"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_goal_opportunities_opportunity"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      international_transfer_requests: {
        Row: {
          actual_exchange_rate: number | null
          actual_transfer_amount: number | null
          actual_transfer_date: string | null
          approved_at: string | null
          approved_by: string | null
          attachment_urls: string[] | null
          awb_document_url: string | null
          bank_charges: number | null
          certificate_urls: string[] | null
          ci_document_url: string | null
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
          packing_list_url: string | null
          payment_deadline: string | null
          payment_purpose: string
          pi_document_url: string | null
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
          transfer_confirmation_url: string | null
          transfer_evidence_urls: string[] | null
          transfer_executed_at: string | null
          transfer_fee: number | null
          transfer_number: string
          transfer_reference_number: string | null
          transfer_request_document_url: string | null
          transfer_slip_url: string | null
          updated_at: string
        }
        Insert: {
          actual_exchange_rate?: number | null
          actual_transfer_amount?: number | null
          actual_transfer_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          attachment_urls?: string[] | null
          awb_document_url?: string | null
          bank_charges?: number | null
          certificate_urls?: string[] | null
          ci_document_url?: string | null
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
          packing_list_url?: string | null
          payment_deadline?: string | null
          payment_purpose: string
          pi_document_url?: string | null
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
          transfer_confirmation_url?: string | null
          transfer_evidence_urls?: string[] | null
          transfer_executed_at?: string | null
          transfer_fee?: number | null
          transfer_number: string
          transfer_reference_number?: string | null
          transfer_request_document_url?: string | null
          transfer_slip_url?: string | null
          updated_at?: string
        }
        Update: {
          actual_exchange_rate?: number | null
          actual_transfer_amount?: number | null
          actual_transfer_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          attachment_urls?: string[] | null
          awb_document_url?: string | null
          bank_charges?: number | null
          certificate_urls?: string[] | null
          ci_document_url?: string | null
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
          packing_list_url?: string | null
          payment_deadline?: string | null
          payment_purpose?: string
          pi_document_url?: string | null
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
          transfer_confirmation_url?: string | null
          transfer_evidence_urls?: string[] | null
          transfer_executed_at?: string | null
          transfer_fee?: number | null
          transfer_number?: string
          transfer_reference_number?: string | null
          transfer_request_document_url?: string | null
          transfer_slip_url?: string | null
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
      key_account_goals: {
        Row: {
          achievement_percent: number | null
          created_at: string
          created_by: string | null
          current_value: number
          customer_id: string
          end_date: string
          goal_description: string | null
          goal_name: string
          goal_type: string
          id: string
          priority: string
          sales_person_id: string
          start_date: string
          status: string
          target_unit: string
          target_value: number
          updated_at: string
        }
        Insert: {
          achievement_percent?: number | null
          created_at?: string
          created_by?: string | null
          current_value?: number
          customer_id: string
          end_date: string
          goal_description?: string | null
          goal_name: string
          goal_type?: string
          id?: string
          priority?: string
          sales_person_id: string
          start_date?: string
          status?: string
          target_unit?: string
          target_value?: number
          updated_at?: string
        }
        Update: {
          achievement_percent?: number | null
          created_at?: string
          created_by?: string | null
          current_value?: number
          customer_id?: string
          end_date?: string
          goal_description?: string | null
          goal_name?: string
          goal_type?: string
          id?: string
          priority?: string
          sales_person_id?: string
          start_date?: string
          status?: string
          target_unit?: string
          target_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_goals_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_goals_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers_with_field_security"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_goals_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "fk_goals_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "secure_key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "fk_goals_customer"
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
      login_logs: {
        Row: {
          additional_info: Json | null
          created_at: string | null
          device_info: Json | null
          email: string
          expires_at: string | null
          failure_reason: string | null
          id: string
          ip_address: string | null
          location_info: Json | null
          login_method: string | null
          login_type: string
          session_id: string | null
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          additional_info?: Json | null
          created_at?: string | null
          device_info?: Json | null
          email: string
          expires_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location_info?: Json | null
          login_method?: string | null
          login_type?: string
          session_id?: string | null
          status: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          additional_info?: Json | null
          created_at?: string | null
          device_info?: Json | null
          email?: string
          expires_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location_info?: Json | null
          login_method?: string | null
          login_type?: string
          session_id?: string | null
          status?: string
          user_agent?: string | null
          user_id?: string | null
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
      monthly_lottery: {
        Row: {
          created_at: string
          draw_date: string | null
          id: string
          month: number
          prize_description: string | null
          status: string
          total_entries: number
          winner_user_id: string | null
          year: number
        }
        Insert: {
          created_at?: string
          draw_date?: string | null
          id?: string
          month: number
          prize_description?: string | null
          status?: string
          total_entries?: number
          winner_user_id?: string | null
          year: number
        }
        Update: {
          created_at?: string
          draw_date?: string | null
          id?: string
          month?: number
          prize_description?: string | null
          status?: string
          total_entries?: number
          winner_user_id?: string | null
          year?: number
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
          products: Json | null
          project_name: string | null
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
          products?: Json | null
          project_name?: string | null
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
          products?: Json | null
          project_name?: string | null
          source?: string | null
          stage?: string
          updated_at?: string
          value?: number
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_opportunities_customer_id"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_opportunities_customer_id"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers_with_field_security"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_opportunities_customer_id"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "fk_opportunities_customer_id"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "secure_key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "fk_opportunities_customer_id"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
      opportunity_documents: {
        Row: {
          created_at: string
          description: string | null
          document_type: string
          file_path: string
          file_size: number | null
          id: string
          name: string
          opportunity_id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type: string
          file_path: string
          file_size?: number | null
          id?: string
          name: string
          opportunity_id: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string
          file_path?: string
          file_size?: number | null
          id?: string
          name?: string
          opportunity_id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          product_name: string
          product_sku: string | null
          quantity: number
          status: string | null
          stripe_session_id: string | null
          total_amount: number
          unit_price: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          product_name: string
          product_sku?: string | null
          quantity?: number
          status?: string | null
          stripe_session_id?: string | null
          total_amount: number
          unit_price: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          product_name?: string
          product_sku?: string | null
          quantity?: number
          status?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          unit_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
      payment_orders: {
        Row: {
          amount: number
          bank_transaction_ref: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          expires_at: string | null
          id: string
          items: Json | null
          order_number: string
          paid_at: string | null
          payment_method: string
          payment_status: string
          qr_code_data: string | null
          reference_1: string | null
          reference_2: string | null
          shipping_address: Json | null
          updated_at: string
        }
        Insert: {
          amount: number
          bank_transaction_ref?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          expires_at?: string | null
          id?: string
          items?: Json | null
          order_number: string
          paid_at?: string | null
          payment_method?: string
          payment_status?: string
          qr_code_data?: string | null
          reference_1?: string | null
          reference_2?: string | null
          shipping_address?: Json | null
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_transaction_ref?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          expires_at?: string | null
          id?: string
          items?: Json | null
          order_number?: string
          paid_at?: string | null
          payment_method?: string
          payment_status?: string
          qr_code_data?: string | null
          reference_1?: string | null
          reference_2?: string | null
          shipping_address?: Json | null
          updated_at?: string
        }
        Relationships: []
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
      podcasts: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          file_path: string
          file_size: number | null
          file_url: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          file_path: string
          file_size?: number | null
          file_url: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          file_path?: string
          file_size?: number | null
          file_url?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          created_at: string
          id: string
          points: number
          reason: string
          share_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          reason: string
          share_id?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          reason?: string
          share_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "product_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      popular_searches: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          search_context: string | null
          search_count: number | null
          search_term: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          search_context?: string | null
          search_count?: number | null
          search_term: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          search_context?: string | null
          search_count?: number | null
          search_term?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_additional_options: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_percentage: boolean | null
          name: string
          option_type: string
          percentage: number | null
          price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_percentage?: boolean | null
          name: string
          option_type: string
          percentage?: number | null
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_percentage?: boolean | null
          name?: string
          option_type?: string
          percentage?: number | null
          price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_applications: {
        Row: {
          application_description: string | null
          application_name: string
          created_at: string | null
          icon_name: string | null
          id: string
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          application_description?: string | null
          application_name: string
          created_at?: string | null
          icon_name?: string | null
          id?: string
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          application_description?: string | null
          application_name?: string
          created_at?: string | null
          icon_name?: string | null
          id?: string
          product_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_applications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_assets: {
        Row: {
          asset_type: string
          created_at: string
          created_by: string | null
          description: string | null
          download_count: number
          file_name: string
          file_path: string
          file_size: number | null
          file_url: string
          id: string
          is_public: boolean
          language: string | null
          product_id: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          asset_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number
          file_name: string
          file_path: string
          file_size?: number | null
          file_url: string
          id?: string
          is_public?: boolean
          language?: string | null
          product_id?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          asset_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_public?: boolean
          language?: string | null
          product_id?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_assets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_configurations: {
        Row: {
          configuration_description: string | null
          configuration_name: string
          created_at: string | null
          id: string
          is_available: boolean | null
          is_default: boolean | null
          price: number
          product_id: string | null
          sku_suffix: string | null
          sort_order: number | null
          specifications: Json | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          configuration_description?: string | null
          configuration_name: string
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          is_default?: boolean | null
          price: number
          product_id?: string | null
          sku_suffix?: string | null
          sort_order?: number | null
          specifications?: Json | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          configuration_description?: string | null
          configuration_name?: string
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          is_default?: boolean | null
          price?: number
          product_id?: string | null
          sku_suffix?: string | null
          sort_order?: number | null
          specifications?: Json | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_configurations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_downloads: {
        Row: {
          created_at: string | null
          description: string | null
          download_category: string | null
          download_count: number | null
          file_name: string
          file_size_mb: number | null
          file_type: string
          file_url: string
          id: string
          is_public: boolean | null
          language: string | null
          product_id: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          download_category?: string | null
          download_count?: number | null
          file_name: string
          file_size_mb?: number | null
          file_type: string
          file_url: string
          id?: string
          is_public?: boolean | null
          language?: string | null
          product_id?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          download_category?: string | null
          download_count?: number | null
          file_name?: string
          file_size_mb?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_public?: boolean | null
          language?: string | null
          product_id?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_downloads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_favorites: {
        Row: {
          created_at: string
          id: string
          is_favorited: boolean
          product_name: string
          product_series: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_favorited?: boolean
          product_name: string
          product_series: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_favorited?: boolean
          product_name?: string
          product_series?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_features: {
        Row: {
          created_at: string | null
          feature_description: string | null
          feature_name: string
          icon_name: string | null
          id: string
          is_key_feature: boolean | null
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          feature_description?: string | null
          feature_name: string
          icon_name?: string | null
          id?: string
          is_key_feature?: boolean | null
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          feature_description?: string | null
          feature_name?: string
          icon_name?: string | null
          id?: string
          is_key_feature?: boolean | null
          product_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_features_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          display_order: number | null
          file_size: number | null
          file_type: string | null
          height: number | null
          id: string
          image_path: string
          image_url: string
          is_active: boolean | null
          is_primary: boolean | null
          product_id: string | null
          product_variant_id: string | null
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number | null
          file_size?: number | null
          file_type?: string | null
          height?: number | null
          id?: string
          image_path: string
          image_url: string
          is_active?: boolean | null
          is_primary?: boolean | null
          product_id?: string | null
          product_variant_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number | null
          file_size?: number | null
          file_type?: string | null
          height?: number | null
          id?: string
          image_path?: string
          image_url?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          product_id?: string | null
          product_variant_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
          {
            foreignKeyName: "product_inquiries_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      product_interactions: {
        Row: {
          created_at: string
          id: string
          image_id: string | null
          interaction_type: string
          metadata: Json | null
          product_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_id?: string | null
          interaction_type: string
          metadata?: Json | null
          product_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_id?: string | null
          interaction_type?: string
          metadata?: Json | null
          product_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_masters: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          display_brightness_nits: number | null
          display_resolution: string | null
          display_size_inches: number | null
          display_type: string | null
          features: string[] | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_touch_screen: boolean | null
          model: string
          name: string
          panel_type: string | null
          specifications: Json | null
          updated_at: string
          viewing_angle: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_brightness_nits?: number | null
          display_resolution?: string | null
          display_size_inches?: number | null
          display_type?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_touch_screen?: boolean | null
          model: string
          name: string
          panel_type?: string | null
          specifications?: Json | null
          updated_at?: string
          viewing_angle?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_brightness_nits?: number | null
          display_resolution?: string | null
          display_size_inches?: number | null
          display_type?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_touch_screen?: boolean | null
          model?: string
          name?: string
          panel_type?: string | null
          specifications?: Json | null
          updated_at?: string
          viewing_angle?: string | null
        }
        Relationships: []
      }
      product_matrix_configurations: {
        Row: {
          base_price: number
          category: string
          created_at: string
          id: string
          product_name: string
          ram_16gb: number
          ram_32gb: number
          ram_4gb: number
          ram_8gb: number
          status: string
          storage_128gb: number
          storage_1tb: number
          storage_256gb: number
          storage_512gb: number
          updated_at: string
        }
        Insert: {
          base_price?: number
          category?: string
          created_at?: string
          id?: string
          product_name: string
          ram_16gb?: number
          ram_32gb?: number
          ram_4gb?: number
          ram_8gb?: number
          status?: string
          storage_128gb?: number
          storage_1tb?: number
          storage_256gb?: number
          storage_512gb?: number
          updated_at?: string
        }
        Update: {
          base_price?: number
          category?: string
          created_at?: string
          id?: string
          product_name?: string
          ram_16gb?: number
          ram_32gb?: number
          ram_4gb?: number
          ram_8gb?: number
          status?: string
          storage_128gb?: number
          storage_1tb?: number
          storage_256gb?: number
          storage_512gb?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_media: {
        Row: {
          ai_analyzed_at: string | null
          ai_description: string | null
          alt_text: string | null
          created_at: string | null
          description: string | null
          file_name: string | null
          file_size: number | null
          file_url: string
          id: string
          is_primary: boolean | null
          media_type: string
          product_id: string | null
          sort_order: number | null
          title: string | null
        }
        Insert: {
          ai_analyzed_at?: string | null
          ai_description?: string | null
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          is_primary?: boolean | null
          media_type: string
          product_id?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Update: {
          ai_analyzed_at?: string | null
          ai_description?: string | null
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_primary?: boolean | null
          media_type?: string
          product_id?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          option_description: string | null
          option_name: string
          option_type: string | null
          price: number
          price_type: string | null
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          option_description?: string | null
          option_name: string
          option_type?: string | null
          price: number
          price_type?: string | null
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          option_description?: string | null
          option_name?: string
          option_type?: string | null
          price?: number
          price_type?: string | null
          product_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      product_ratings: {
        Row: {
          created_at: string
          id: string
          product_name: string
          product_series: string
          rating: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_name: string
          product_series: string
          rating: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_name?: string
          product_series?: string
          rating?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_series: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          hero_image_url: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_series_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_shares: {
        Row: {
          created_at: string
          id: string
          product_name: string
          product_series: string
          share_content: Json | null
          share_platform: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_name: string
          product_series: string
          share_content?: Json | null
          share_platform: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_name?: string
          product_series?: string
          share_content?: Json | null
          share_platform?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_specifications: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_highlight: boolean | null
          product_id: string | null
          sort_order: number | null
          spec_name: string
          spec_value: string
          unit: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_highlight?: boolean | null
          product_id?: string | null
          sort_order?: number | null
          spec_name: string
          spec_value: string
          unit?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_highlight?: boolean | null
          product_id?: string | null
          sort_order?: number | null
          spec_name?: string
          spec_value?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          campaign_description: string | null
          campaign_eligible: boolean | null
          campaign_end_date: string | null
          campaign_start_date: string | null
          china_factory_promo: boolean | null
          created_at: string
          endurance_rating: string | null
          extended_warranty_price: number | null
          has_extended_warranty: boolean | null
          id: string
          is_software: boolean | null
          item_condition: string | null
          last_synced_at: string | null
          original_china_price: number | null
          price: number
          product_master_id: string
          rating: number | null
          repair_notes: string | null
          repair_order_id: string | null
          repaired_date: string | null
          service_request_id: string | null
          sku: string
          source_system: string | null
          special_badges: string[] | null
          special_campaign_price: number | null
          status: string | null
          stock: number
          sync_status: string | null
          updated_at: string
          variant_name: string
          variant_options: Json | null
          warranty_months: number | null
          years_in_market: number | null
        }
        Insert: {
          campaign_description?: string | null
          campaign_eligible?: boolean | null
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          china_factory_promo?: boolean | null
          created_at?: string
          endurance_rating?: string | null
          extended_warranty_price?: number | null
          has_extended_warranty?: boolean | null
          id?: string
          is_software?: boolean | null
          item_condition?: string | null
          last_synced_at?: string | null
          original_china_price?: number | null
          price?: number
          product_master_id: string
          rating?: number | null
          repair_notes?: string | null
          repair_order_id?: string | null
          repaired_date?: string | null
          service_request_id?: string | null
          sku: string
          source_system?: string | null
          special_badges?: string[] | null
          special_campaign_price?: number | null
          status?: string | null
          stock?: number
          sync_status?: string | null
          updated_at?: string
          variant_name: string
          variant_options?: Json | null
          warranty_months?: number | null
          years_in_market?: number | null
        }
        Update: {
          campaign_description?: string | null
          campaign_eligible?: boolean | null
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          china_factory_promo?: boolean | null
          created_at?: string
          endurance_rating?: string | null
          extended_warranty_price?: number | null
          has_extended_warranty?: boolean | null
          id?: string
          is_software?: boolean | null
          item_condition?: string | null
          last_synced_at?: string | null
          original_china_price?: number | null
          price?: number
          product_master_id?: string
          rating?: number | null
          repair_notes?: string | null
          repair_order_id?: string | null
          repaired_date?: string | null
          service_request_id?: string | null
          sku?: string
          source_system?: string | null
          special_badges?: string[] | null
          special_campaign_price?: number | null
          status?: string | null
          stock?: number
          sync_status?: string | null
          updated_at?: string
          variant_name?: string
          variant_options?: Json | null
          warranty_months?: number | null
          years_in_market?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_master_id_fkey"
            columns: ["product_master_id"]
            isOneToOne: false
            referencedRelation: "product_masters"
            referencedColumns: ["id"]
          },
        ]
      }
      product_videos: {
        Row: {
          created_at: string
          duration_seconds: number | null
          file_size: number | null
          id: string
          is_active: boolean
          is_featured: boolean
          product_master_id: string | null
          thumbnail_url: string | null
          updated_at: string
          uploaded_by: string | null
          variant_id: string | null
          video_description: string | null
          video_title: string
          video_type: string
          video_url: string
          view_count: number
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_size?: number | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          product_master_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          uploaded_by?: string | null
          variant_id?: string | null
          video_description?: string | null
          video_title: string
          video_type?: string
          video_url: string
          view_count?: number
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_size?: number | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          product_master_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          uploaded_by?: string | null
          variant_id?: string | null
          video_description?: string | null
          video_title?: string
          video_type?: string
          video_url?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_videos_product_master_id_fkey"
            columns: ["product_master_id"]
            isOneToOne: false
            referencedRelation: "product_masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_videos_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
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
          badges: Json | null
          base_price: number | null
          brand: string | null
          campaign_description: string | null
          campaign_eligible: boolean | null
          campaign_end_date: string | null
          campaign_start_date: string | null
          category: string | null
          china_factory_promo: boolean | null
          created_at: string
          currency: string | null
          description: string | null
          endurance_rating: string | null
          extended_warranty_price: number | null
          featured: boolean | null
          has_extended_warranty: boolean | null
          id: string
          is_promotion: boolean | null
          is_software: boolean
          item_condition: string | null
          last_synced_at: string | null
          model: string | null
          name: string
          original_china_price: number | null
          price: number
          product_status: string | null
          promotion_text: string | null
          promotional_price: number | null
          rating: number | null
          repair_notes: string | null
          repair_order_id: string | null
          repaired_date: string | null
          seo_description: string | null
          seo_title: string | null
          series_id: string | null
          service_request_id: string | null
          short_description: string | null
          sku: string
          source_system: string | null
          special_badges: string[] | null
          special_campaign_price: number | null
          status: string
          stock: number
          stock_quantity: number | null
          stock_status: string | null
          sync_status: string | null
          updated_at: string
          warranty_months: number | null
          warranty_period_days: number | null
          years_in_market: number | null
        }
        Insert: {
          badges?: Json | null
          base_price?: number | null
          brand?: string | null
          campaign_description?: string | null
          campaign_eligible?: boolean | null
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          category?: string | null
          china_factory_promo?: boolean | null
          created_at?: string
          currency?: string | null
          description?: string | null
          endurance_rating?: string | null
          extended_warranty_price?: number | null
          featured?: boolean | null
          has_extended_warranty?: boolean | null
          id?: string
          is_promotion?: boolean | null
          is_software?: boolean
          item_condition?: string | null
          last_synced_at?: string | null
          model?: string | null
          name: string
          original_china_price?: number | null
          price?: number
          product_status?: string | null
          promotion_text?: string | null
          promotional_price?: number | null
          rating?: number | null
          repair_notes?: string | null
          repair_order_id?: string | null
          repaired_date?: string | null
          seo_description?: string | null
          seo_title?: string | null
          series_id?: string | null
          service_request_id?: string | null
          short_description?: string | null
          sku: string
          source_system?: string | null
          special_badges?: string[] | null
          special_campaign_price?: number | null
          status?: string
          stock?: number
          stock_quantity?: number | null
          stock_status?: string | null
          sync_status?: string | null
          updated_at?: string
          warranty_months?: number | null
          warranty_period_days?: number | null
          years_in_market?: number | null
        }
        Update: {
          badges?: Json | null
          base_price?: number | null
          brand?: string | null
          campaign_description?: string | null
          campaign_eligible?: boolean | null
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          category?: string | null
          china_factory_promo?: boolean | null
          created_at?: string
          currency?: string | null
          description?: string | null
          endurance_rating?: string | null
          extended_warranty_price?: number | null
          featured?: boolean | null
          has_extended_warranty?: boolean | null
          id?: string
          is_promotion?: boolean | null
          is_software?: boolean
          item_condition?: string | null
          last_synced_at?: string | null
          model?: string | null
          name?: string
          original_china_price?: number | null
          price?: number
          product_status?: string | null
          promotion_text?: string | null
          promotional_price?: number | null
          rating?: number | null
          repair_notes?: string | null
          repair_order_id?: string | null
          repaired_date?: string | null
          seo_description?: string | null
          seo_title?: string | null
          series_id?: string | null
          service_request_id?: string | null
          short_description?: string | null
          sku?: string
          source_system?: string | null
          special_badges?: string[] | null
          special_campaign_price?: number | null
          status?: string
          stock?: number
          stock_quantity?: number | null
          stock_status?: string | null
          sync_status?: string | null
          updated_at?: string
          warranty_months?: number | null
          warranty_period_days?: number | null
          years_in_market?: number | null
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
            foreignKeyName: "products_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "product_series"
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
          bio: string | null
          created_at: string
          customer_id: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          role: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          customer_id?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          customer_id?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers_with_field_security"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "secure_key_account_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "supplier_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      project_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          file_path: string | null
          file_size: number | null
          file_url: string | null
          id: string
          project_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          project_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          project_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          product_id: string
          product_model: string | null
          product_name: string
          project_id: string
          quantity: number
          specifications: Json | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          product_model?: string | null
          product_name: string
          project_id: string
          quantity?: number
          specifications?: Json | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          product_model?: string | null
          product_name?: string
          project_id?: string
          quantity?: number
          specifications?: Json | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_timeline: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          message: string | null
          project_id: string
          status: Database["public"]["Enums"]["project_status"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string | null
          project_id: string
          status: Database["public"]["Enums"]["project_status"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["project_status"]
        }
        Relationships: [
          {
            foreignKeyName: "project_timeline_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          company_name: string
          contact_name: string
          created_at: string
          currency: string | null
          customer_id: string | null
          description: string | null
          email: string
          estimated_price: number | null
          expected_delivery_date: string | null
          final_price: number | null
          id: string
          phone: string
          project_end_date: string | null
          project_name: string
          project_number: string | null
          project_start_date: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["project_status"]
          submitted_at: string | null
          tor_content: string | null
          tor_requirements: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company_name: string
          contact_name: string
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          email: string
          estimated_price?: number | null
          expected_delivery_date?: string | null
          final_price?: number | null
          id?: string
          phone: string
          project_end_date?: string | null
          project_name: string
          project_number?: string | null
          project_start_date?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          submitted_at?: string | null
          tor_content?: string | null
          tor_requirements?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          description?: string | null
          email?: string
          estimated_price?: number | null
          expected_delivery_date?: string | null
          final_price?: number | null
          id?: string
          phone?: string
          project_end_date?: string | null
          project_name?: string
          project_number?: string | null
          project_start_date?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          submitted_at?: string | null
          tor_content?: string | null
          tor_requirements?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_order_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          purchase_order_id: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          purchase_order_id: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          purchase_order_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_attachments_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
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
      purchase_order_payment_schedules: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          installment_number: number
          paid_amount: number | null
          paid_date: string | null
          payment_reference: string | null
          purchase_order_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          installment_number: number
          paid_amount?: number | null
          paid_date?: string | null
          payment_reference?: string | null
          purchase_order_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          paid_amount?: number | null
          paid_date?: string | null
          payment_reference?: string | null
          purchase_order_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_payment_schedules_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          advance_payment_amount: number | null
          advance_payment_percentage: number | null
          cash_discount_days: number | null
          cash_discount_percentage: number | null
          created_at: string
          created_by: string | null
          customer_company: string | null
          customer_id: string | null
          customer_name: string
          customer_po_number: string | null
          delivery_date: string | null
          id: string
          installment_count: number | null
          late_payment_fee_percentage: number | null
          notes: string | null
          payment_currency: string | null
          payment_due_days: number | null
          payment_method: string | null
          payment_schedule: Json | null
          payment_status: string | null
          payment_terms_type: string | null
          po_date: string
          po_number: string
          sales_person_id: string | null
          source_system: string
          status: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          advance_payment_amount?: number | null
          advance_payment_percentage?: number | null
          cash_discount_days?: number | null
          cash_discount_percentage?: number | null
          created_at?: string
          created_by?: string | null
          customer_company?: string | null
          customer_id?: string | null
          customer_name: string
          customer_po_number?: string | null
          delivery_date?: string | null
          id?: string
          installment_count?: number | null
          late_payment_fee_percentage?: number | null
          notes?: string | null
          payment_currency?: string | null
          payment_due_days?: number | null
          payment_method?: string | null
          payment_schedule?: Json | null
          payment_status?: string | null
          payment_terms_type?: string | null
          po_date?: string
          po_number: string
          sales_person_id?: string | null
          source_system?: string
          status?: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          advance_payment_amount?: number | null
          advance_payment_percentage?: number | null
          cash_discount_days?: number | null
          cash_discount_percentage?: number | null
          created_at?: string
          created_by?: string | null
          customer_company?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_po_number?: string | null
          delivery_date?: string | null
          id?: string
          installment_count?: number | null
          late_payment_fee_percentage?: number | null
          notes?: string | null
          payment_currency?: string | null
          payment_due_days?: number | null
          payment_method?: string | null
          payment_schedule?: Json | null
          payment_status?: string | null
          payment_terms_type?: string | null
          po_date?: string
          po_number?: string
          sales_person_id?: string | null
          source_system?: string
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
      reward_redemptions: {
        Row: {
          created_at: string
          id: string
          points_used: number
          redemption_code: string | null
          reward_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          points_used: number
          redemption_code?: string | null
          reward_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          points_used?: number
          redemption_code?: string | null
          reward_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          points_required: number
          reward_type: string
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          points_required: number
          reward_type?: string
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          points_required?: number
          reward_type?: string
          stock_quantity?: number | null
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
      search_history: {
        Row: {
          created_at: string
          id: string
          last_searched_at: string | null
          result_count: number | null
          search_context: string | null
          search_count: number | null
          search_term: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_searched_at?: string | null
          result_count?: number | null
          search_context?: string | null
          search_count?: number | null
          search_term: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_searched_at?: string | null
          result_count?: number | null
          search_context?: string | null
          search_count?: number | null
          search_term?: string
          updated_at?: string
          user_id?: string | null
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
            referencedRelation: "customers_with_field_security"
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
            referencedRelation: "secure_key_account_performance"
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
      user_permissions: {
        Row: {
          created_at: string
          granted_at: string
          granted_by: string | null
          id: string
          permission_key: string
          permission_value: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_key: string
          permission_value?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_key?: string
          permission_value?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          available_points: number
          created_at: string
          id: string
          points_earned: number
          points_used: number
          this_month_shares: number
          total_shares: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          available_points?: number
          created_at?: string
          id?: string
          points_earned?: number
          points_used?: number
          this_month_shares?: number
          total_shares?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          available_points?: number
          created_at?: string
          id?: string
          points_earned?: number
          points_used?: number
          this_month_shares?: number
          total_shares?: number
          updated_at?: string
          user_id?: string | null
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
      customers_with_field_security: {
        Row: {
          contact_person: string | null
          created_at: string | null
          customer_type: string | null
          email: string | null
          id: string | null
          name: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contact_person?: never
          created_at?: string | null
          customer_type?: string | null
          email?: never
          id?: string | null
          name?: never
          phone?: never
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_person?: never
          created_at?: string | null
          customer_type?: string | null
          email?: never
          id?: string | null
          name?: never
          phone?: never
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
        Insert: {
          annual_revenue_target?: number | null
          calls_actual?: never
          calls_target?: never
          contact_frequency_met?: never
          contact_status?: never
          customer_id?: string | null
          customer_name?: string | null
          days_since_last_contact?: never
          key_account_tier?: string | null
          key_account_weight?: number | null
          last_contact_date?: string | null
          meetings_achievement_percent?: never
          meetings_actual?: never
          meetings_target?: never
          minimum_contact_frequency?: number | null
          next_required_contact?: string | null
          revenue_achievement_percent?: never
          revenue_actual?: never
          revenue_target?: number | null
          sales_person_id?: string | null
        }
        Update: {
          annual_revenue_target?: number | null
          calls_actual?: never
          calls_target?: never
          contact_frequency_met?: never
          contact_status?: never
          customer_id?: string | null
          customer_name?: string | null
          days_since_last_contact?: never
          key_account_tier?: string | null
          key_account_weight?: number | null
          last_contact_date?: string | null
          meetings_achievement_percent?: never
          meetings_actual?: never
          meetings_target?: never
          minimum_contact_frequency?: number | null
          next_required_contact?: string | null
          revenue_achievement_percent?: never
          revenue_actual?: never
          revenue_target?: number | null
          sales_person_id?: string | null
        }
        Relationships: []
      }
      opportunities_secure: {
        Row: {
          assigned_to: string | null
          company_name: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          expected_close_date: string | null
          id: string | null
          probability: number | null
          stage: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          company_name?: never
          created_at?: string | null
          created_by?: string | null
          email?: never
          expected_close_date?: string | null
          id?: string | null
          probability?: number | null
          stage?: string | null
          updated_at?: string | null
          value?: never
        }
        Update: {
          assigned_to?: string | null
          company_name?: never
          created_at?: string | null
          created_by?: string | null
          email?: never
          expected_close_date?: string | null
          id?: string | null
          probability?: number | null
          stage?: string | null
          updated_at?: string | null
          value?: never
        }
        Relationships: []
      }
      sales_performance_summary: {
        Row: {
          achievement_percent: number | null
          commission_amount: number | null
          created_at: string | null
          period_month: number | null
          period_year: number | null
          receipts_value: number | null
          sales_person_id: string | null
          updated_at: string | null
        }
        Insert: {
          achievement_percent?: number | null
          commission_amount?: never
          created_at?: string | null
          period_month?: number | null
          period_year?: number | null
          receipts_value?: never
          sales_person_id?: string | null
          updated_at?: string | null
        }
        Update: {
          achievement_percent?: number | null
          commission_amount?: never
          created_at?: string | null
          period_month?: number | null
          period_year?: number | null
          receipts_value?: never
          sales_person_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      secure_key_account_performance: {
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
        Insert: {
          annual_revenue_target?: number | null
          calls_actual?: never
          calls_target?: never
          contact_frequency_met?: never
          contact_status?: never
          customer_id?: string | null
          customer_name?: string | null
          days_since_last_contact?: never
          key_account_tier?: string | null
          key_account_weight?: number | null
          last_contact_date?: string | null
          meetings_achievement_percent?: never
          meetings_actual?: never
          meetings_target?: never
          minimum_contact_frequency?: number | null
          next_required_contact?: string | null
          revenue_achievement_percent?: never
          revenue_actual?: never
          revenue_target?: never
          sales_person_id?: string | null
        }
        Update: {
          annual_revenue_target?: number | null
          calls_actual?: never
          calls_target?: never
          contact_frequency_met?: never
          contact_status?: never
          customer_id?: string | null
          customer_name?: string | null
          days_since_last_contact?: never
          key_account_tier?: string | null
          key_account_weight?: number | null
          last_contact_date?: string | null
          meetings_achievement_percent?: never
          meetings_actual?: never
          meetings_target?: never
          minimum_contact_frequency?: number | null
          next_required_contact?: string | null
          revenue_achievement_percent?: never
          revenue_actual?: never
          revenue_target?: never
          sales_person_id?: string | null
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
      technicians_secure_info: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: never
          id?: string | null
          is_active?: boolean | null
          name?: never
          phone?: never
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: never
          id?: string | null
          is_active?: boolean | null
          name?: never
          phone?: never
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invitation: { Args: { invitation_token: string }; Returns: Json }
      advance_workflow_stage: {
        Args: { new_stage: string; user_notes?: string; workflow_id: string }
        Returns: boolean
      }
      archive_key_accounts: { Args: { customer_ids: string[] }; Returns: Json }
      auto_assign_staff: {
        Args: { delivery_order_id: string }
        Returns: string
      }
      auto_assign_technician: { Args: { request_id: string }; Returns: string }
      award_purchase_points: {
        Args: {
          customer_uuid: string
          purchase_amount: number
          reference_id_param?: string
        }
        Returns: number
      }
      award_share_points: {
        Args: { p_points?: number; p_share_id: string; p_user_id: string }
        Returns: boolean
      }
      calculate_loyalty_tier: {
        Args: { annual_spent: number }
        Returns: string
      }
      calculate_tiered_commission: {
        Args: { sales_amount: number; target_amount: number }
        Returns: number
      }
      can_access_key_account_activity: {
        Args: {
          _customer_id: string
          _sales_person_id: string
          _user_id: string
        }
        Returns: boolean
      }
      can_access_sales_performance: {
        Args: { _sales_person_id: string; _user_id: string }
        Returns: boolean
      }
      can_issue_receipt_for_tax_invoice: {
        Args: { tax_invoice_id_param: string }
        Returns: boolean
      }
      can_manage_credit_applications: {
        Args: { _user_id: string }
        Returns: boolean
      }
      can_manage_customers: { Args: { _user_id: string }; Returns: boolean }
      can_manage_inventory: { Args: { _user_id: string }; Returns: boolean }
      can_view_credit_workflow: { Args: { _user_id: string }; Returns: boolean }
      can_view_customer_banking_data: {
        Args: { _user_id: string }
        Returns: boolean
      }
      can_view_customer_basic_info: {
        Args: { _user_id: string }
        Returns: boolean
      }
      can_view_customer_details: {
        Args: { _user_id: string }
        Returns: boolean
      }
      can_view_customer_financial_data: {
        Args: { _user_id: string }
        Returns: boolean
      }
      can_view_customer_identification_data: {
        Args: { _user_id: string }
        Returns: boolean
      }
      can_view_customer_personal_data: {
        Args: { _user_id: string }
        Returns: boolean
      }
      can_view_sensitive_customer_data: {
        Args: { _user_id: string }
        Returns: boolean
      }
      can_view_technician_basic_info: {
        Args: { _user_id: string }
        Returns: boolean
      }
      can_view_technician_contact_info: {
        Args: { _user_id: string }
        Returns: boolean
      }
      check_duplicate_tax_id: {
        Args: { tax_id_param: string }
        Returns: {
          company_id: string
          company_name: string
          credit_status: string
          employee_count: number
          existing_credit_limit: number
          verification_status: string
        }[]
      }
      check_key_account_ownership_conflict: {
        Args: { customer_id_param: string; requesting_user_id: string }
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
      designate_key_account_safely:
        | {
            Args: {
              contact_frequency_param?: number
              customer_id_param: string
              requesting_user_id?: string
              revenue_target_param?: number
              tier_param: string
              weight_param?: number
            }
            Returns: Json
          }
        | {
            Args: {
              contact_frequency?: number
              customer_uuid: string
              new_annual_target?: number
              new_tier: string
              new_weight?: number
            }
            Returns: Json
          }
      generate_claim_number: { Args: never; Returns: string }
      generate_credit_application_number: { Args: never; Returns: string }
      generate_credit_order_number: { Args: never; Returns: string }
      generate_customer_quote_number: { Args: never; Returns: string }
      generate_delivery_number: { Args: never; Returns: string }
      generate_inquiry_number: { Args: never; Returns: string }
      generate_invoice_number: { Args: never; Returns: string }
      generate_payment_number: { Args: never; Returns: string }
      generate_payment_order_number: { Args: never; Returns: string }
      generate_po_number: { Args: never; Returns: string }
      generate_project_number: { Args: never; Returns: string }
      generate_quotation_number: { Args: never; Returns: string }
      generate_receipt_number: { Args: never; Returns: string }
      generate_repair_number: { Args: never; Returns: string }
      generate_tax_invoice_number: { Args: never; Returns: string }
      generate_ticket_number: { Args: never; Returns: string }
      generate_transfer_number: { Args: never; Returns: string }
      get_available_component_options: {
        Args: { p_base_product_id: string; p_current_selections?: Json }
        Returns: {
          component_type: string
          component_value: string
          display_order: number
          is_available: boolean
          is_percentage: boolean
          price_adjustment: number
          restriction_reason: string
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_customer_safely: {
        Args: { _customer_id: string }
        Returns: {
          address: string
          contact_person: string
          created_at: string
          customer_type: string
          email: string
          id: string
          name: string
          phone: string
          status: string
          updated_at: string
        }[]
      }
      get_customer_securely: {
        Args: { _access_reason?: string; _customer_id: string }
        Returns: {
          address: string
          assigned_sales_person: string
          contact_person: string
          customer_type: string
          email: string
          id: string
          is_key_account: boolean
          key_account_tier: string
          name: string
          phone: string
          status: string
        }[]
      }
      get_key_account_performance_for_user: {
        Args: never
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
      get_login_statistics: {
        Args: { p_days_back?: number; p_user_id?: string }
        Returns: {
          failed_logins: number
          last_login: string
          most_used_device: string
          successful_logins: number
          total_logins: number
          unique_ips: number
        }[]
      }
      get_opportunities_safely: {
        Args: never
        Returns: {
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
          products: Json | null
          project_name: string | null
          source: string | null
          stage: string
          updated_at: string
          value: number
          website: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "opportunities"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_orphaned_key_accounts: {
        Args: never
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
      get_sales_performance_safely: {
        Args: { _sales_person_id?: string }
        Returns: {
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
        }[]
        SetofOptions: {
          from: "*"
          to: "sales_performance"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_secure_customer_data: { Args: { customer_id: string }; Returns: Json }
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
      get_technician_securely: {
        Args: { _access_reason?: string; _technician_id: string }
        Returns: {
          email: string
          id: string
          is_available: boolean
          name: string
          phone: string
          rating: number
          specialization: string
          total_jobs: number
        }[]
      }
      has_permission: {
        Args: { _permission_key: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_asset_download_count: {
        Args: { asset_id: string }
        Returns: undefined
      }
      increment_datasheet_download_count: {
        Args: { file_id: string }
        Returns: undefined
      }
      increment_product_download_count: {
        Args: { download_id: string }
        Returns: undefined
      }
      increment_video_view_count: {
        Args: { video_id: string }
        Returns: undefined
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_assigned_sales_person: {
        Args: { _customer_assigned_sales_person: string; _user_id: string }
        Returns: boolean
      }
      is_technician_viewing_own_data: {
        Args: { _technician_user_id: string; _user_id: string }
        Returns: boolean
      }
      link_receipt_to_quotation: {
        Args: { quotation_number_param: string; receipt_uuid: string }
        Returns: boolean
      }
      list_customers_secure: {
        Args: never
        Returns: {
          access_level: string
          assigned_sales_person: string
          contact_person: string
          created_at: string
          customer_type: string
          email_display: string
          id: string
          is_key_account: boolean
          name: string
          phone_display: string
        }[]
      }
      log_bi_data_access: {
        Args: { _action: string; _record_id: string; _table_name: string }
        Returns: undefined
      }
      log_customer_access: {
        Args: {
          action_type: string
          customer_id: string
          customer_name?: string
        }
        Returns: undefined
      }
      log_login_attempt: {
        Args: { ip_address?: string; success: boolean; user_email: string }
        Returns: undefined
      }
      log_sensitive_customer_access:
        | {
            Args: {
              _access_reason?: string
              _action_type: string
              _customer_id: string
              _fields_accessed: string[]
            }
            Returns: undefined
          }
        | {
            Args: {
              access_type: string
              accessed_fields: string[]
              customer_id: string
            }
            Returns: undefined
          }
      log_technician_data_access: {
        Args: {
          _access_reason?: string
          _action_type: string
          _fields_accessed: string[]
          _technician_id: string
        }
        Returns: undefined
      }
      log_unauthorized_customer_access: { Args: never; Returns: undefined }
      log_user_action: {
        Args: {
          action_type: string
          details?: Json
          resource_id: string
          resource_type: string
        }
        Returns: undefined
      }
      log_user_login:
        | {
            Args: {
              p_device_info?: Json
              p_email: string
              p_failed_reason?: string
              p_ip_address?: string
              p_location_info?: Json
              p_login_type?: string
              p_session_id?: string
              p_status: string
              p_user_agent?: string
              p_user_id?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_additional_info?: Json
              p_device_info?: Json
              p_email?: string
              p_failure_reason?: string
              p_ip_address?: string
              p_location_info?: Json
              p_login_method?: string
              p_login_type?: string
              p_session_id?: string
              p_status?: string
              p_user_agent?: string
              p_user_id?: string
            }
            Returns: string
          }
      mark_all_notifications_read: { Args: never; Returns: number }
      mark_notification_read: {
        Args: { notification_id: string }
        Returns: boolean
      }
      mask_sensitive_data: {
        Args: { data_value: string; mask_type?: string }
        Returns: string
      }
      recalculate_sales_metrics: {
        Args: {
          sales_person_uuid: string
          target_month: number
          target_year: number
        }
        Returns: undefined
      }
      record_search: {
        Args: { p_context?: string; p_search_term: string; p_user_id?: string }
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
      remove_key_account_designation: {
        Args: { customer_uuid: string; removal_reason?: string }
        Returns: Json
      }
      restore_key_account_designation: {
        Args: { customer_uuid: string; restore_reason?: string }
        Returns: Json
      }
      unarchive_key_accounts: {
        Args: { customer_ids: string[] }
        Returns: Json
      }
      validate_customer_access: {
        Args: { _customer_id: string; _user_id: string }
        Returns: boolean
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
      app_role:
        | "admin"
        | "accountant"
        | "user"
        | "sales"
        | "finance_staff"
        | "finance_manager"
      priority_level: "low" | "medium" | "high" | "urgent"
      process_type: "standard" | "downpayment" | "conversion" | "purchase_order"
      project_status:
        | "draft"
        | "submitted"
        | "reviewing"
        | "price_quoted"
        | "approved"
        | "in_progress"
        | "completed"
        | "cancelled"
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
      app_role: [
        "admin",
        "accountant",
        "user",
        "sales",
        "finance_staff",
        "finance_manager",
      ],
      priority_level: ["low", "medium", "high", "urgent"],
      process_type: ["standard", "downpayment", "conversion", "purchase_order"],
      project_status: [
        "draft",
        "submitted",
        "reviewing",
        "price_quoted",
        "approved",
        "in_progress",
        "completed",
        "cancelled",
      ],
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
