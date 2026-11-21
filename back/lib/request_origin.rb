# frozen_string_literal: true

# Tells whether a request was started by a page on another website, or on another
# subdomain of ours (CSRF protection). Browsers attach our cookies to such requests,
# so they must neither sign anyone in nor act as the signed-in user. See
# CrossSiteRequestGuard and AuthToken::Cookie.read.
module RequestOrigin
  # Values of the Sec-Fetch-Site request header for requests we trust. `same-origin`:
  # the request comes from our own page. `none`: the user typed the address or used a
  # bookmark. Anything else (`cross-site`, `same-site` = another subdomain) is foreign.
  OWN_FETCH_SITES = %w[same-origin none].freeze

  module_function

  # The browser sets Sec-Fetch-Site and Origin, and pages can't change them. Browsers
  # that don't send Sec-Fetch-Site (Safari before 16.4, older WebViews) still send
  # Origin on requests that change data, so we compare it with our host. A request
  # with neither header comes from a client that isn't a browser (public API client,
  # MCP client, ...), which no other website can make the user's browser send.
  #
  # @param request [ActionDispatch::Request, Rack::Request]
  def other_site?(request)
    fetch_site = request.get_header('HTTP_SEC_FETCH_SITE')
    return OWN_FETCH_SITES.exclude?(fetch_site) if fetch_site

    origin = request.get_header('HTTP_ORIGIN')
    return false if origin.nil?

    # `Origin: null` (sandboxed iframes, some redirects) has no host, so it's foreign too.
    origin_host(origin) != request.host
  end

  def origin_host(origin)
    URI.parse(origin).host
  rescue URI::InvalidURIError
    nil
  end
end
