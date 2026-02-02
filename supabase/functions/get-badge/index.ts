// @ts-ignore: Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// Menggunakan library resmi Supabase untuk Deno (Esm.sh)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
// Fungsi untuk merender Badge versi "Terkunci"
function renderLockedBadge() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="140" height="20" role="img">
      <linearGradient id="s" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <clipPath id="r">
        <rect width="140" height="20" rx="3" fill="#fff"/>
      </clipPath>
      <g clip-path="url(#r)">
        <rect width="70" height="20" fill="#555"/>
        <rect x="70" width="70" height="20" fill="#9f9f9f"/> <rect width="140" height="20" fill="url(#s)"/>
      </g>
      <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110">
        <text x="350" y="140" transform="scale(.1)" textLength="600">ViceAgent</text>
        <text x="1050" y="140" transform="scale(.1)" textLength="600">PRO ONLY</text>
      </g>
    </svg>
  `;
}
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const url = new URL(req.url);
    // Kita ambil 'token' dari URL (?token=...)
    const publicToken = url.searchParams.get('token');

    if (!publicToken) {
      return new Response("Missing token", { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // STEP 1: Ambil agent_config berdasarkan public_token
    const { data: agent, error: agentErr } = await supabase
      .from('agent_configs')
      .select('id, user_id')
      .eq('public_token', publicToken)
      .single();

    if (agentErr || !agent) {
      console.error("Agent not found:", agentErr);
      return new Response("Agent Not Found", { status: 404 });
    }

    // STEP 2: Ambil status is_pro dari tabel profiles (berdasarkan user_id si agent)
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', agent.user_id)
      .single();

    // STEP 3: Ambil report terbaru berdasarkan project_id (agent.id)
    const { data: report, error: repErr } = await supabase
      .from('scan_reports')
      .select('health_score')
      .eq('project_id', agent.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const isPro = profile?.is_pro === true;
    const score = report?.health_score ?? 0;

    console.log(`Debug: User ${agent.user_id} | Pro: ${isPro} | Score: ${score}`);

    // LOGIKA RENDER
    if (!isPro) {
      return new Response(renderLockedBadge(), {
        headers: { ...corsHeaders, 'Content-Type': 'image/svg+xml' }
      });
    }

    // Tentukan warna
    let color = '#ef4444'; 
    if (score >= 80) color = '#10b981';
    else if (score >= 50) color = '#f59e0b';

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="110" height="20">
      <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
      <clipPath id="r"><rect width="110" height="20" rx="3" fill="#fff"/></clipPath>
      <g clip-path="url(#r)">
        <rect width="65" height="20" fill="#555"/>
        <rect x="65" width="45" height="20" fill="${color}"/>
        <rect width="110" height="20" fill="url(#s)"/>
      </g>
      <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110">
        <text x="335" y="140" transform="scale(.1)" textLength="550">ViceAgent</text>
        <text x="865" y="140" transform="scale(.1)" textLength="350">${score}%</text>
      </g>
    </svg>`;

    return new Response(svg, {
      headers: { ...corsHeaders, 
        'Content-Type': 'image/svg+xml', 
        'Cache-Control': 'no-cache, no-store, must-revalidate,proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
       },
       status: 200
    });

  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
})