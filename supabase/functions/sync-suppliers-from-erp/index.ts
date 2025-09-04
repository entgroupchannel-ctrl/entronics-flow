import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SupplierData {
  company_name: string;
  company_name_en?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  supplier_grade?: string;
  payment_terms?: string;
  delivery_time_days?: number;
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
        if (!supplierData.company_name) {
          results.skipped++;
          results.errors.push({
            company_name: supplierData.company_name || 'unknown',
            error: 'Missing required field: company_name'
          });
          continue;
        }

        // Check if supplier already exists (by company_name or email)
        let existingSupplier = null;
        let checkError = null;

        // First try to find by company_name
        const { data: supplierByName, error: nameError } = await supabase
          .from('customers')
          .select('id, updated_at')
          .eq('name', supplierData.company_name)
          .eq('customer_type', 'ผู้จำหน่าย')
          .maybeSingle();

        if (nameError) {
          console.error('Error checking existing supplier by name:', nameError);
        } else if (supplierByName) {
          existingSupplier = supplierByName;
        }

        // If not found by name and email is provided, try email
        if (!existingSupplier && supplierData.email) {
          const { data: supplierByEmail, error: emailError } = await supabase
            .from('customers')
            .select('id, updated_at')
            .eq('email', supplierData.email)
            .eq('customer_type', 'ผู้จำหน่าย')
            .maybeSingle();

          if (emailError) {
            console.error('Error checking existing supplier by email:', emailError);
          } else if (supplierByEmail) {
            existingSupplier = supplierByEmail;
          }
        }

        // Generate supplier_code if not provided
        const supplierCode = `SUP${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const supplierRecord = {
          name: supplierData.company_name,
          supplier_code: supplierCode,
          contact_person: supplierData.contact_person,
          phone: supplierData.phone,
          email: supplierData.email,
          address: supplierData.address,
          supplier_country: supplierData.country || 'Thailand',
          supplier_currency: 'THB',
          payment_terms: supplierData.payment_terms,
          customer_type: 'ผู้จำหน่าย',
          source_system: 'erp',
          last_synced_at: new Date().toISOString(),
          sync_status: 'synced',
          supplier_registration_status: 'approved', // ERP suppliers are pre-approved
          compliance_status: 'approved',
          // Map supplier_grade to ratings
          quality_rating: supplierData.supplier_grade === 'A' ? 5 : 
                         supplierData.supplier_grade === 'B' ? 4 : 
                         supplierData.supplier_grade === 'C' ? 3 : null,
          delivery_rating: supplierData.supplier_grade === 'A' ? 5 : 
                          supplierData.supplier_grade === 'B' ? 4 : 
                          supplierData.supplier_grade === 'C' ? 3 : null,
          price_rating: supplierData.supplier_grade === 'A' ? 5 : 
                       supplierData.supplier_grade === 'B' ? 4 : 
                       supplierData.supplier_grade === 'C' ? 3 : null
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
              company_name: supplierData.company_name,
              error: updateError.message
            });
          } else {
            results.updated++;
            console.log(`Updated supplier: ${supplierData.company_name}`);
          }
        } else {
          // Create new supplier
          const { error: insertError } = await supabase
            .from('customers')
            .insert([supplierRecord]);

          if (insertError) {
            console.error('Error creating supplier:', insertError);
            results.errors.push({
              company_name: supplierData.company_name,
              error: insertError.message
            });
          } else {
            results.created++;
            console.log(`Created supplier: ${supplierData.company_name}`);
          }
        }

      } catch (error) {
        console.error('Error processing supplier:', error);
        results.errors.push({
          company_name: supplierData.company_name || 'unknown',
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