import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface SyncRequest {
  entityType: 'supplier' | 'product' | 'inquiry';
  entityId: string;
  syncDirection: 'to_erp' | 'from_erp';
  forceSync?: boolean;
}

interface SupplierData {
  id: string;
  company_name: string;
  company_name_en?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  supplier_grade?: string;
  quality_score?: number;
  price_competitiveness?: number;
  reliability_score?: number;
  business_license?: string;
  certification_iso?: boolean;
  certification_ce?: boolean;
  certification_fcc?: boolean;
  product_categories?: string[];
  specializations?: string[];
  total_orders?: number;
  successful_orders?: number;
  is_active?: boolean;
  is_preferred?: boolean;
  payment_terms?: string;
  minimum_order_amount?: number;
  currency?: string;
  erp_supplier_code?: string;
}

async function logSyncAttempt(
  syncType: string,
  entityId: string,
  entityType: string,
  syncDirection: string,
  syncData: any,
  status: 'pending' | 'synced' | 'failed' = 'pending',
  errorMessage?: string
) {
  try {
    const { error } = await supabase.from('sync_logs').insert({
      sync_type: syncType,
      entity_id: entityId,
      entity_type: entityType,
      sync_status: status,
      sync_direction: syncDirection,
      sync_data: syncData,
      error_message: errorMessage,
      synced_at: status === 'synced' ? new Date().toISOString() : null,
    });

    if (error) {
      console.error('Error logging sync attempt:', error);
    }
  } catch (error) {
    console.error('Error in logSyncAttempt:', error);
  }
}

async function syncSupplierToERP(supplierId: string): Promise<{ success: boolean; message: string; erpCode?: string }> {
  try {
    // ดึงข้อมูล supplier จากฐานข้อมูล
    const { data: supplier, error: fetchError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', supplierId)
      .single();

    if (fetchError || !supplier) {
      await logSyncAttempt('supplier_sync', supplierId, 'supplier', 'to_erp', null, 'failed', 'Supplier not found');
      return { success: false, message: 'Supplier not found' };
    }

    // เตรียมข้อมูลสำหรับส่งไปยัง ERP
    const erpData = {
      supplier_id: supplier.id,
      company_name: supplier.company_name,
      company_name_en: supplier.company_name_en,
      contact_person: supplier.contact_person,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      province: supplier.province,
      country: supplier.country || 'Thailand',
      supplier_grade: supplier.supplier_grade,
      quality_score: supplier.quality_score,
      price_competitiveness: supplier.price_competitiveness,
      reliability_score: supplier.reliability_score,
      business_license: supplier.business_license,
      certifications: {
        iso: supplier.certification_iso,
        ce: supplier.certification_ce,
        fcc: supplier.certification_fcc
      },
      product_categories: supplier.product_categories || [],
      specializations: supplier.specializations || [],
      statistics: {
        total_orders: supplier.total_orders || 0,
        successful_orders: supplier.successful_orders || 0
      },
      status: {
        is_active: supplier.is_active,
        is_preferred: supplier.is_preferred
      },
      payment_terms: supplier.payment_terms,
      minimum_order_amount: supplier.minimum_order_amount,
      currency: supplier.currency || 'USD',
      sync_timestamp: new Date().toISOString()
    };

    await logSyncAttempt('supplier_sync', supplierId, 'supplier', 'to_erp', erpData, 'pending');

    // จำลองการส่งข้อมูลไปยัง ERP (ในตัวอย่างนี้จะ mock)
    // ในการใช้งานจริง จะต้องเรียก API ของ ERP ที่นี่
    const mockErpResponse = await mockERPCall(erpData);

    if (mockErpResponse.success) {
      // อัพเดตสถานะ sync ใน supplier table
      const { error: updateError } = await supabase
        .from('suppliers')
        .update({
          erp_sync_status: 'synced',
          last_synced_at: new Date().toISOString(),
          erp_supplier_code: mockErpResponse.supplier_code
        })
        .eq('id', supplierId);

      if (updateError) {
        console.error('Error updating supplier sync status:', updateError);
      }

      await logSyncAttempt('supplier_sync', supplierId, 'supplier', 'to_erp', erpData, 'synced');
      
      return {
        success: true,
        message: 'Supplier synced successfully to ERP',
        erpCode: mockErpResponse.supplier_code
      };
    } else {
      await logSyncAttempt('supplier_sync', supplierId, 'supplier', 'to_erp', erpData, 'failed', mockErpResponse.error);
      return { success: false, message: mockErpResponse.error };
    }

  } catch (error) {
    console.error('Error syncing supplier to ERP:', error);
    await logSyncAttempt('supplier_sync', supplierId, 'supplier', 'to_erp', null, 'failed', error.message);
    return { success: false, message: 'Internal server error' };
  }
}

async function mockERPCall(supplierData: any): Promise<{ success: boolean; supplier_code?: string; error?: string }> {
  // จำลองการเรียก API ของ ERP
  // ในการใช้งานจริงจะต้องแทนที่ด้วย HTTP request ไปยัง ERP API
  
  console.log('Sending supplier data to ERP:', supplierData);
  
  // จำลองความล่าช้าของการเรียก API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // จำลองการตอบกลับจาก ERP
  if (supplierData.company_name && supplierData.email) {
    return {
      success: true,
      supplier_code: `ERP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  } else {
    return {
      success: false,
      error: 'Missing required fields: company_name and email'
    };
  }
}

async function getActiveSuppliers(): Promise<{ success: boolean; data?: SupplierData[]; message?: string }> {
  try {
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('supplier_grade', { ascending: true })
      .order('quality_score', { ascending: false });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data: suppliers || [] };
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return { success: false, message: 'Internal server error' };
  }
}

async function bulkSyncSuppliers(): Promise<{ success: boolean; results: any[]; message: string }> {
  const { data: suppliers } = await getActiveSuppliers();
  
  if (!suppliers || suppliers.length === 0) {
    return { success: false, results: [], message: 'No active suppliers found' };
  }

  const results = [];
  
  for (const supplier of suppliers) {
    try {
      const syncResult = await syncSupplierToERP(supplier.id);
      results.push({
        supplier_id: supplier.id,
        company_name: supplier.company_name,
        ...syncResult
      });
    } catch (error) {
      results.push({
        supplier_id: supplier.id,
        company_name: supplier.company_name,
        success: false,
        message: error.message
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  
  return {
    success: successCount > 0,
    results,
    message: `Synced ${successCount}/${results.length} suppliers successfully`
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    // GET /suppliers - ดึงข้อมูล suppliers สำหรับ ERP
    if (req.method === 'GET' && action === 'suppliers') {
      const result = await getActiveSuppliers();
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 500,
      });
    }

    // POST /sync - ซิงค์ข้อมูลไปยัง ERP
    if (req.method === 'POST') {
      const body: SyncRequest = await req.json();

      if (action === 'bulk-sync') {
        const result = await bulkSyncSuppliers();
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      if (body.entityType === 'supplier') {
        const result = await syncSupplierToERP(body.entityId);
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 200 : 400,
        });
      }

      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Unsupported entity type' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Method not allowed' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });

  } catch (error) {
    console.error('Error in sync-to-erp function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});