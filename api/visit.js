export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    return res.status(500).json({ error: 'Webhook not configured' })
  }

  try {
    const { ua, lang, tz, ref, w, h } = req.body || {}

    // IP
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'Desconhecido'

    // Geolocalização
    let geo = { country: '?', regionName: '?', city: '?', isp: '?' }
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,isp,status`)
      const geoData = await geoRes.json()
      if (geoData.status === 'success') geo = geoData
    } catch (_) {}

    // User-agent
    const userAgent = ua || req.headers['user-agent'] || ''
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent)
    if (isBot) return res.status(200).json({ ok: true })

    let browser = 'Desconhecido'
    if (/edg\//i.test(userAgent)) browser = 'Edge'
    else if (/opr\//i.test(userAgent)) browser = 'Opera'
    else if (/chrome/i.test(userAgent)) browser = 'Chrome'
    else if (/firefox/i.test(userAgent)) browser = 'Firefox'
    else if (/safari/i.test(userAgent)) browser = 'Safari'

    let os = 'Desconhecido'
    if (/windows/i.test(userAgent)) os = 'Windows'
    else if (/android/i.test(userAgent)) os = 'Android'
    else if (/iphone|ipad/i.test(userAgent)) os = 'iOS'
    else if (/mac/i.test(userAgent)) os = 'macOS'
    else if (/linux/i.test(userAgent)) os = 'Linux'

    // ── Detecta origem (referrer) ──────────────────────────
    function parseSource(refUrl) {
      if (!refUrl) return null
      try {
        const url = new URL(refUrl)
        const host = url.hostname.toLowerCase()

        if (/discord/.test(host))    return { emoji: '🎮', label: 'Discord',   url: refUrl }
        if (/instagram/.test(host))  return { emoji: '📸', label: 'Instagram', url: refUrl }
        if (/twitter|x\.com/.test(host)) return { emoji: '🐦', label: 'Twitter / X', url: refUrl }
        if (/tiktok/.test(host))     return { emoji: '🎵', label: 'TikTok',    url: refUrl }
        if (/youtube/.test(host))    return { emoji: '▶️', label: 'YouTube',   url: refUrl }
        if (/twitch/.test(host))     return { emoji: '💜', label: 'Twitch',    url: refUrl }
        if (/google/.test(host))     return { emoji: '🔍', label: 'Google',    url: refUrl }
        if (/whatsapp/.test(host))   return { emoji: '💬', label: 'WhatsApp',  url: refUrl }
        if (/telegram/.test(host))   return { emoji: '✈️', label: 'Telegram',  url: refUrl }
        if (/reddit/.test(host))     return { emoji: '🤖', label: 'Reddit',    url: refUrl }
        if (/github/.test(host))     return { emoji: '🐙', label: 'GitHub',    url: refUrl }
        if (/spotify/.test(host))    return { emoji: '🎧', label: 'Spotify',   url: refUrl }

        // Domínio desconhecido — mostra o host limpo
        return { emoji: '🔗', label: host, url: refUrl }
      } catch (_) {
        return { emoji: '🔗', label: refUrl, url: null }
      }
    }

    const source = parseSource(ref)

    // Hora BRT
    const now = new Date()
    const brt = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(now)

    // Embed
    const embed = {
      title: '👁  Nova visita — jjxvnz.bio',
      color: 0x111111,
      fields: [
        { name: '🕐 Horário (BRT)',  value: brt,                                              inline: true  },
        { name: '🌍 Localização',    value: `${geo.city}, ${geo.regionName} — ${geo.country}`, inline: true  },
        { name: '📡 ISP',            value: geo.isp || '?',                                   inline: true  },
        { name: '💻 Dispositivo',    value: `${isMobile ? '📱 Mobile' : '🖥️ Desktop'} · ${browser} · ${os}`, inline: true },
        { name: '🖥️ Resolução',      value: w && h ? `${w}×${h}` : '?',                      inline: true  },
        { name: '🌐 Idioma',         value: lang || '?',                                      inline: true  },
        {
          name: source
            ? `${source.emoji} Veio de — ${source.label}`
            : '🔗 Origem',
          value: source
            ? (source.url ? `[${source.label}](${source.url})` : source.label)
            : 'Acesso direto (digitou o link ou favorito)',
          inline: false
        },
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
