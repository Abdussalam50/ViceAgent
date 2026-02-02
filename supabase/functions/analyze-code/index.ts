// @ts-ignore: Deno is available in Supabase environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}


serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { symbol, message, context } = await req.json()
    const isComplexity = message?.toLowerCase().includes('complexity') || symbol?.toLowerCase().includes('complex');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

    const finalPrompt = `
Bertindaklah sebagai Senior Software Engineer & Ahli Clean Code.
Tolong analisis masalah berikut:
- Isu: ${isComplexity ? 'Complexity/Architecture' : 'Code Error/Lint'}
- Identitas: ${symbol}
- Pesan: ${message}
- Kode Sumber: ${context || 'Tidak ada potongan kode yang tersedia'}

Berikan penjelasan dalam Bahasa Indonesia dengan format:
1. **Analisis Penyebab**: Mengapa ini terjadi?
2. **Solusi Praktis**: Bagaimana cara memperbaikinya secara konsep?
3. **Langkah-langkah Perbaikan**: Berikan list 1, 2, 3 langkah konkret.

Balas dengan format Markdown yang rapi.
`;
    if (!GEMINI_API_KEY) throw new Error("API Key Gemini tidak ditemukan")

    // PERBAIKAN: Gunakan API v1 (bukan v1beta) dan model ID 'gemini-1.5-flash'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: finalPrompt 
            }] 
          }]
        })
      }
    )

    const data = await response.json();

    // Log untuk melihat jika Google menolak permintaan
    if (data.error) {
      console.error("Google API Error:", data.error.message);
      return new Response(JSON.stringify({ 
        suggestion: `AI Error: ${data.error.message}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI tidak memberikan jawaban.";

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})