function handler(event) {
    var request = event.request
    var uri = request.uri || '/'
    var headers = request.headers || {}
    var userAgent = (headers['user-agent'] && headers['user-agent'].value) || ''

    var isBot = /facebookexternalhit|linkedinbot|whatsapp|twitterbot|telegram|slack|discord|googlebot|bingbot|applebot|ia_archiver|crawler/i.test(userAgent)
    var isArticleRoute = /^\/articles\/[^/?#]+\/?$/.test(uri)

    if (!isBot || !isArticleRoute) {
        return request
    }

    var slug = uri.replace(/^\/articles\//, '').replace(/\/$/, '')

    if (!slug) {
        return request
    }

    request.uri = '/social-preview/articles/' + encodeURIComponent(slug)
    return request
}
