import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SupplierData {
  supplier_code: string;
  name: string;
  business_registration_number?: string;
  business_type?: string;
  established_year?: number;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  supplier_country?: string;
  supplier_category?: string;
  supplier_currency?: string;
  bank_name?: string;
  bank_account?: string;
  swift_code?: string;
  bank_address?: string;
  main_products?: string[];
  certifications?: string[];
  is_preferred_supplier?: boolean;
  compliance_status?: string;
  quality_rating?: number;
  delivery_rating?: number;
  price_rating?: number;
}

interface SyncRequest {
  suppliers: SupplierData[];
  sync_id?: string;
  erp_system?: string;
}

Deno.serve(async (req) => {
  console.log('Sync suppliers from ERP request received');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: SyncRequest = await req.json();
    console.log('Processing sync request:', {
      suppliersCount: body.suppliers?.length || 0,
      syncId: body.sync_id,
      erpSystem: body.erp_system
    });

    if (!body.suppliers || !Array.isArray(body.suppliers)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: suppliers array is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const results = {
      total: body.suppliers.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as any[]
    };

    // Process each supplier
    for (const supplierData of body.suppliers) {
      try {
        if (!supplierData.name || !supplierData.supplier_code) {
          results.skipped++;
          results.errors.push({
            supplier_code: supplierData.supplier_code || 'unknown',
            error: 'Missing required fields: name and supplier_code'
          });
          continue;
        }

        // Check if supplier already exists
        const { data: existingSupplier, error: checkError } = await supabase
          .from('customers')
          .select('id, updated_at')
          .eq('supplier_code', supplierData.supplier_code)
          .eq('customer_type', 'ผู้จำหน่าย')
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing supplier:', checkError);
          results.errors.push({
            supplier_code: supplierData.supplier_code,
            error: checkError.message
          });
          continue;
        }

        const supplierRecord = {
          name: supplierData.name,
          supplier_code: supplierData.supplier_code,
          business_registration_number: supplierData.business_registration_number,
          business_type: supplierData.business_type,
          established_year: supplierData.established_year,
          contact_person: supplierData.contact_person,
          phone: supplierData.phone,
          email: supplierData.email,
          website: supplierData.website,
          address: supplierData.address,
          supplier_country: supplierData.supplier_country,
          supplier_category: supplierData.supplier_category,
          supplier_currency: supplierData.supplier_currency || 'USD',
          bank_name: supplierData.bank_name,
          bank_account: supplierData.bank_account,
          swift_code: supplierData.swift_code,
          bank_address: supplierData.bank_address,
          main_products: supplierData.main_products || [],
          certifications: supplierData.certifications || [],
          is_preferred_supplier: supplierData.is_preferred_supplier || false,
          compliance_status: supplierData.compliance_status || 'pending',
          quality_rating: supplierData.quality_rating,
          delivery_rating: supplierData.delivery_rating,
          price_rating: supplierData.price_rating,
          customer_type: 'ผู้จำหน่าย',
          source_system: 'erp',
          last_synced_at: new Date().toISOString(),
          sync_status: 'synced',
          supplier_registration_status: 'approved' // ERP suppliers are pre-approved
        };

        if (existingSupplier) {
          // Update existing supplier
          const { error: updateError } = await supabase
            .from('customers')
            .update({
              ...supplierRecord,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSupplier.id);

          if (updateError) {
            console.error('Error updating supplier:', updateError);
            results.errors.push({
              supplier_code: supplierData.supplier_code,
              error: updateError.message
            });
          } else {
            results.updated++;
            console.log(`Updated supplier: ${supplierData.name}`);
          }
        } else {
          // Create new supplier
          const { error: insertError } = await supabase
            .from('customers')
            .insert([supplierRecord]);

          if (insertError) {
            console.error('Error creating supplier:', insertError);
            results.errors.push({
              supplier_code: supplierData.supplier_code,
              error: insertError.message
            });
          } else {
            results.created++;
            console.log(`Created supplier: ${supplierData.name}`);
          }
        }

      } catch (error) {
        console.error('Error processing supplier:', error);
        results.errors.push({
          supplier_code: supplierData.supplier_code || 'unknown',
          error: error.message
        });
      }
    }

    // Log the sync operation
    try {
      await supabase
        .from('sync_logs')
        .insert([{
          operation_type: 'supplier_sync',
          sync_direction: 'from_erp',
          total_records: results.total,
          successful_records: results.created + results.updated,
          failed_records: results.errors.length,
          skipped_records: results.skipped,
          sync_details: {
            sync_id: body.sync_id,
            erp_system: body.erp_system,
            results: results
          }
        }]);
    } catch (logError) {
      console.error('Error logging sync operation:', logError);
    }

    console.log('Sync completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Supplier sync completed',
        results: results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in sync-suppliers-from-erp:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});