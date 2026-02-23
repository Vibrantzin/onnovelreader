// supabase/functions/notify-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, title, message } = await req.json()
    console.log('Request received - user_id:', user_id, 'title:', title)

    if (!user_id || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendKey = Deno.env.get('RESEND_API_KEY')

    console.log('RESEND_API_KEY present:', !!resendKey)

    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service role to look up user email (bypasses auth)
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id)

    if (userError || !user?.email) {
      console.error('User lookup error:', userError)
      return new Response(
        JSON.stringify({ error: 'User not found', details: userError?.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending email to:', user.email)

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Novel Reader <notifications@novelreader.tech>',
        to: user.email,
        subject: title,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
            <h1 style="font-size:20px;font-weight:700;margin-bottom:8px;letter-spacing:-0.5px">NOVEL READER</h1>
            <hr style="border:none;border-top:1px solid #e4e4e7;margin-bottom:24px"/>
            <h2 style="font-size:16px;font-weight:600;color:#18181b;margin-bottom:12px">${title}</h2>
            <p style="font-size:14px;color:#52525b;line-height:1.6">${message}</p>
            <hr style="border:none;border-top:1px solid #e4e4e7;margin-top:24px;margin-bottom:16px"/>
            <p style="font-size:12px;color:#a1a1aa">You received this notification from Novel Reader.</p>
            <p style="font-size:12px;color:#a1a1aa">Questions? Contact us at support@novelreader.tech</p>
          </div>
        `,
      }),
    })

    const result = await emailRes.json()
    console.log('Resend response status:', emailRes.status)
    console.log('Resend response:', JSON.stringify(result))

    if (!emailRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Resend API error', details: result }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, sent_to: user.email }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Unexpected error:', String(err))
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})