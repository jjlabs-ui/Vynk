export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    return res.status(500).json({ error: 'Webhook not configured' })
  }

  try {
    // Pega dados da requisição
    const { ua, lang, tz, ref, w, h } = req.body || {}

    // IP do visitante
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'Desconhecido'

    // Geolocalização via ip-api (gratuito, sem key)
    let geo = { country: '?', regionName: '?', city: '?', isp: '?' }
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,isp,status`)
      const geoData = await geoRes.json()
      if (geoData.status === 'success') geo = geoData
    } catch (_) {}

    // Detecta dispositivo pelo user-agent
    const userAgent = ua || req.headers['user-agent'] || ''
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent)

    if (isBot) return res.status(200).json({ ok: true }) // ignora bots

    // Detecta navegador
    let browser = 'Desconhecido'
    if (/edg\//i.test(userAgent)) browser = 'Edge'
    else if (/opr\//i.test(userAgent)) browser = 'Opera'
    else if (/chrome/i.test(userAgent)) browser = 'Chrome'
    else if (/firefox/i.test(userAgent)) browser = 'Firefox'
    else if (/safari/i.test(userAgent)) browser = 'Safari'

    // Detecta OS
    let os = 'Desconhecido'
    if (/windows/i.test(userAgent)) os = 'Windows'
    else if (/android/i.test(userAgent)) os = 'Android'
    else if (/iphone|ipad/i.test(userAgent)) os = 'iOS'
    else if (/mac/i.test(userAgent)) os = 'macOS'
    else if (/linux/i.test(userAgent)) os = 'Linux'

    // Hora em BRT
    const now = new Date()
    const brt = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(now)

    // Monta embed do Discord
    const embed = {
      title: '👁  Nova visita — jjxvnz.bio',
      color: 0x1a1a1a,
      fields: [
        { name: '🕐 Horário (BRT)', value: brt, inline: true },
        { name: '🌍 Localização', value: `${geo.city}, ${geo.regionName} — ${geo.country}`, inline: true },
        { name: '📡 ISP', value: geo.isp || '?', inline: true },
        { name: '💻 Dispositivo', value: `${isMobile ? '📱 Mobile' : '🖥️ Desktop'} · ${browser} · ${os}`, inline: true },
        { name: '🖥️ Resolução', value: w && h ? `${w}×${h}` : '?', inline: true },
        { name: '🌐 Idioma', value: lang || '?', inline: true },
        ...(ref ? [{ name: '🔗 Veio de', value: ref, inline: false }] : []),
      ],
      footer: { text: `IP: ${ip}` },
      timestamp: now.toISOString(),
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
