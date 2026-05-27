export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return res.status(500).json({ error: 'Webhook not configured' })

  try {
    const {
      ua, lang, langs, tz,
      ref, url,
      utm_source, utm_medium, utm_campaign,
      w, h, dpr, vw, vh, colorDepth,
      platform, cores, memory, touch, online,
      connType, connDown, battery, cookieEnabled,
    } = req.body || {}

    // IP
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'Desconhecido'

    // Geolocalização
    let geo = { country: '?', regionName: '?', city: '?', isp: '?', org: '?', as: '?', lat: null, lon: null }
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,zip,isp,org,as,lat,lon,proxy,hosting`)
      const geoData = await geoRes.json()
      if (geoData.status === 'success') geo = geoData
    } catch (_) {}

    // User-agent
    const userAgent = ua || req.headers['user-agent'] || ''
    const isBot = /bot|crawler|spider|crawling|headless/i.test(userAgent)
    if (isBot) return res.status(200).json({ ok: true })

    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)

    let browser = 'Desconhecido'
    if (/edg\//i.test(userAgent))    browser = 'Edge'
    else if (/opr\//i.test(userAgent)) browser = 'Opera'
    else if (/chrome/i.test(userAgent)) browser = 'Chrome'
    else if (/firefox/i.test(userAgent)) browser = 'Firefox'
    else if (/safari/i.test(userAgent)) browser = 'Safari'

    let os = 'Desconhecido'
    if (/windows nt 10/i.test(userAgent))      os = 'Windows 10/11'
    else if (/windows/i.test(userAgent))        os = 'Windows'
    else if (/android/i.test(userAgent))        os = 'Android'
    else if (/iphone/i.test(userAgent))         os = 'iPhone'
    else if (/ipad/i.test(userAgent))           os = 'iPad'
    else if (/mac os x/i.test(userAgent))       os = 'macOS'
    else if (/linux/i.test(userAgent))          os = 'Linux'

    // ── Detecta origem — UTM tem prioridade sobre referrer ──
    const SOURCE_MAP = {
      discord:   { emoji: '🎮', label: 'Discord'      },
      instagram: { emoji: '📸', label: 'Instagram'    },
      twitter:   { emoji: '🐦', label: 'Twitter / X'  },
      x:         { emoji: '🐦', label: 'Twitter / X'  },
      tiktok:    { emoji: '🎵', label: 'TikTok'       },
      youtube:   { emoji: '▶️', label: 'YouTube'      },
      twitch:    { emoji: '💜', label: 'Twitch'       },
      google:    { emoji: '🔍', label: 'Google'       },
      whatsapp:  { emoji: '💬', label: 'WhatsApp'     },
      telegram:  { emoji: '✈️', label: 'Telegram'     },
      reddit:    { emoji: '🤖', label: 'Reddit'       },
      github:    { emoji: '🐙', label: 'GitHub'       },
      spotify:   { emoji: '🎧', label: 'Spotify'      },
      bio:       { emoji: '🔗', label: 'Bio link'     },
    }

    let sourceEmoji = '🔗'
    let sourceLabel = 'Acesso direto'

    if (utm_source) {
      const key = utm_source.toLowerCase()
      const match = SOURCE_MAP[key]
      sourceEmoji = match ? match.emoji : '🔗'
      sourceLabel = match ? match.label : utm_source
      if (utm_medium)   sourceLabel += ` · ${utm_medium}`
      if (utm_campaign) sourceLabel += ` · ${utm_campaign}`
    } else if (ref) {
      try {
        const refHost = new URL(ref).hostname.toLowerCase()
        for (const [key, val] of Object.entries(SOURCE_MAP)) {
          if (refHost.includes(key)) {
            sourceEmoji = val.emoji
            sourceLabel = val.label
            break
          }
        }
        if (sourceLabel === 'Acesso direto') {
          sourceLabel = refHost
        }
      } catch (_) {}
    }

    // Hora BRT
    const now = new Date()
    const brt = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(now)

    // Mapa do Google
    const mapsUrl = geo.lat && geo.lon
      ? `[📍 Ver no mapa](https://maps.google.com/?q=${geo.lat},${geo.lon})`
      : null

    const embed = {
      title: '👁  Nova visita — jjxvnz.bio',
      color: 0x0d0d0d,
      fields: [
        // Linha 1 — quando/onde
        { name: '🕐 Horário (BRT)',   value: brt,                                                         inline: true },
        { name: '🌍 Localização',     value: `${geo.city}, ${geo.regionName}\n${geo.country}${geo.zip ? ` · CEP ${geo.zip}` : ''}`, inline: true },
        { name: '📡 ISP / Org',       value: `${geo.isp || '?'}\n${geo.org || ''}`,                       inline: true },

        // Linha 2 — dispositivo
        { name: '💻 Dispositivo',     value: `${isMobile ? '📱 Mobile' : '🖥️ Desktop'} · ${browser} · ${os}`, inline: true },
        { name: '🖥️ Tela',            value: `${w}×${h} (${dpr || 1}x DPR)\nJanela: ${vw}×${vh}\n${colorDepth}bit`, inline: true },
        { name: '⚙️ Hardware',        value: `CPU: ${cores} cores\nRAM: ${memory}\nTouch: ${touch ? 'Sim' : 'Não'}`, inline: true },

        // Linha 3 — rede/sistema
        { name: '🌐 Idioma',          value: `${lang || '?'}\n${langs || ''}`,                            inline: true },
        { name: '🕰️ Fuso horário',    value: tz || '?',                                                   inline: true },
        { name: '📶 Conexão',         value: `Tipo: ${connType}\nVel: ${connDown}\nOnline: ${online ? 'Sim' : 'Não'}`, inline: true },

        // Linha 4 — extras
        { name: '🔋 Bateria',         value: battery || '?',                                              inline: true },
        { name: '🍪 Cookies',         value: cookieEnabled ? 'Habilitado' : 'Desabilitado',               inline: true },
        { name: '🖥️ Plataforma',      value: platform || '?',                                             inline: true },

        // Linha 5 — origem
        { name: `${sourceEmoji} Origem`, value: sourceLabel,                                              inline: false },

        // Mapa
        ...(mapsUrl ? [{ name: '🗺️ Coordenadas', value: mapsUrl, inline: false }] : []),

        // Proxy/hosting flag
        ...(geo.proxy || geo.hosting ? [{ name: '⚠️ Aviso', value: `${geo.proxy ? '🔒 Proxy/VPN detectado' : ''}${geo.hosting ? ' · Hosting/Datacenter' : ''}`.trim(), inline: false }] : []),
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
