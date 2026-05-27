export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return res.status(500).json({ error: 'Webhook not configured' })

  try {
    const {
      ua, lang, langs, tz,
      ref, url,
      utm_source, utm_medium, utm_campaign,
      w, h, dpr, vw, vh,
      platform, cores, memory, touch,
      connType, connDown,
      battery, cookieEnabled,
    } = req.body || {}

    // ── IP ────────────────────────────────────────────────
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'unknown'

    // ── Geo ───────────────────────────────────────────────
    let geo = {}
    try {
      const r = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,zip,isp,org,lat,lon,proxy,hosting`)
      const d = await r.json()
      if (d.status === 'success') geo = d
    } catch (_) {}

    // ── User-agent ────────────────────────────────────────
    const userAgent = ua || req.headers['user-agent'] || ''
    if (/bot|crawler|spider|headless/i.test(userAgent)) return res.status(200).json({ ok: true })

    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)

    let browser = 'Unknown'
    if (/edg\//i.test(userAgent))      browser = 'Edge'
    else if (/opr\//i.test(userAgent)) browser = 'Opera'
    else if (/chrome/i.test(userAgent)) browser = 'Chrome'
    else if (/firefox/i.test(userAgent)) browser = 'Firefox'
    else if (/safari/i.test(userAgent)) browser = 'Safari'

    let os = 'Unknown'
    if (/windows nt 10/i.test(userAgent))   os = 'Windows 10/11'
    else if (/windows/i.test(userAgent))    os = 'Windows'
    else if (/android/i.test(userAgent))    os = 'Android'
    else if (/iphone/i.test(userAgent))     os = 'iPhone'
    else if (/ipad/i.test(userAgent))       os = 'iPad'
    else if (/mac os x/i.test(userAgent))   os = 'macOS'
    else if (/linux/i.test(userAgent))      os = 'Linux'

    // ── Origem ────────────────────────────────────────────
    const SOURCE_MAP = {
      discord: 'Discord',   instagram: 'Instagram', twitter: 'Twitter',
      x: 'Twitter / X',    tiktok: 'TikTok',       youtube: 'YouTube',
      twitch: 'Twitch',     google: 'Google',       whatsapp: 'WhatsApp',
      telegram: 'Telegram', reddit: 'Reddit',       github: 'GitHub',
      spotify: 'Spotify',
    }

    let source = 'Direct'
    if (utm_source) {
      const match = SOURCE_MAP[utm_source.toLowerCase()]
      source = match || utm_source
      if (utm_medium)   source += ` / ${utm_medium}`
      if (utm_campaign) source += ` (${utm_campaign})`
    } else if (ref) {
      try {
        const host = new URL(ref).hostname.toLowerCase()
        for (const [key, label] of Object.entries(SOURCE_MAP)) {
          if (host.includes(key)) { source = label; break }
        }
        if (source === 'Direct') source = host
      } catch (_) {}
    }

    // ── Hora BRT ──────────────────────────────────────────
    const now = new Date()
    const brt = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).format(now)

    // ── Monta descrição principal ─────────────────────────
    const loc = [geo.city, geo.regionName, geo.country].filter(Boolean).join(', ')
    const mapLink = geo.lat && geo.lon ? `[maps](https://maps.google.com/?q=${geo.lat},${geo.lon})` : null

    const flags = []
    if (geo.proxy)   flags.push('VPN / Proxy')
    if (geo.hosting) flags.push('Datacenter')

    // ── Embed ─────────────────────────────────────────────
    const embed = {
      title: 'New visitor — jjxvnz.bio',
      color: 0x1c1c1c,
      description: [
        `**${brt}**  ·  IP: \`${ip}\``,
        loc ? `${loc}${mapLink ? `  ·  ${mapLink}` : ''}` : null,
        geo.isp ? `${geo.isp}` : null,
        flags.length ? `⚠ ${flags.join(' · ')}` : null,
      ].filter(Boolean).join('\n'),
      fields: [
        {
          name: 'Device',
          value: [
            `${isMobile ? 'Mobile' : 'Desktop'}  ·  ${browser}  ·  ${os}`,
            `${w}×${h}  ·  ${dpr || 1}x  ·  window ${vw}×${vh}`,
            platform ? `Platform: ${platform}` : null,
          ].filter(Boolean).join('\n'),
          inline: true,
        },
        {
          name: 'System',
          value: [
            cores  ? `CPU: ${cores} cores` : null,
            memory ? `RAM: ${memory}` : null,
            battery && battery !== '?' ? `Battery: ${battery}` : null,
            `Touch: ${touch ? 'Yes' : 'No'}`,
            `Cookies: ${cookieEnabled ? 'Yes' : 'No'}`,
          ].filter(Boolean).join('\n'),
          inline: true,
        },
        {
          name: 'Network',
          value: [
            lang ? `Language: ${lang}` : null,
            tz   ? `Timezone: ${tz}` : null,
            connType && connType !== '?' ? `Connection: ${connType}${connDown && connDown !== '?' ? ` · ${connDown}` : ''}` : null,
          ].filter(Boolean).join('\n'),
          inline: true,
        },
        {
          name: 'Source',
          value: source,
          inline: false,
        },
      ],
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
