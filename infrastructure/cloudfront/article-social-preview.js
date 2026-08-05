'use strict'

const API_GATEWAY_DOMAIN_NAME = 'replace-with-api-gateway-domain-name'
const API_GATEWAY_STAGE_PATH = '/prod'
const BOT_USER_AGENT_PATTERN =
  /facebookexternalhit|facebot|meta-externalagent|meta-externalfetcher|whatsapp|twitterbot|linkedinbot|telegrambot|discordbot|slackbot|googlebot|bingbot|applebot|ia_archiver|crawler/i
const ARTICLE_ROUTE_PATTERN = /^\/articles\/[^/?#]+\/?$/

exports.handler = async (event) => {
  const request = event.Records[0].cf.request
  const uri = request.uri || '/'
  const headers = request.headers || {}
  const userAgent =
    (headers['user-agent'] && headers['user-agent'][0] && headers['user-agent'][0].value) ||
    ''

  if (!BOT_USER_AGENT_PATTERN.test(userAgent) || !ARTICLE_ROUTE_PATTERN.test(uri)) {
    return request
  }

  const rawSlug = uri.replace(/^\/articles\//, '').replace(/\/$/, '')
  const slug = safeDecodeURIComponent(rawSlug)

  if (!slug) {
    return request
  }

  request.uri =
    API_GATEWAY_STAGE_PATH + '/social-preview/articles/' + encodeURIComponent(slug)
  request.origin = {
    custom: {
      domainName: API_GATEWAY_DOMAIN_NAME,
      port: 443,
      protocol: 'https',
      protocolPolicy: 'https-only',
      path: '',
      sslProtocols: ['TLSv1.2'],
      readTimeout: 30,
      keepaliveTimeout: 5,
      customHeaders: {},
    },
  }
  request.headers.host = [{ key: 'Host', value: API_GATEWAY_DOMAIN_NAME }]

  return request
}

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
