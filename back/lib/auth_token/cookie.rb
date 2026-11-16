# frozen_string_literal: true

module AuthToken
  # The HttpOnly cookie carrying the user's auth token. It is the only way the token
  # travels between the browser and the API: the front-end can neither read nor send
  # it explicitly, the browser attaches it to every same-site request.
  module Cookie
    NAME = 'cl2_auth_token'

    # Cookie in which the front-end used to store the token itself. Cleared whenever we
    # set or clear the auth cookie, so no JS-readable copy of a token lingers around.
    # TODO: Remove once all such cookies have expired (max. token lifetime after release).
    LEGACY_NAME = 'cl2_jwt'

    # Values of the Sec-Fetch-Site request header for which we trust the cookie. The browser
    # sets this header and pages can't change it. `same-origin`: the request comes from our
    # own page. `none`: the user typed the address or used a bookmark. No header at all: a
    # client that isn't a browser, or an old browser.
    TRUSTED_FETCH_SITES = [nil, 'same-origin', 'none'].freeze

    module_function

    # Protection against CSRF. A page on another website, or on another subdomain of ours
    # (`same-site`, which the cookie's SameSite setting doesn't stop), can make the user's
    # browser send a request here, and the browser then attaches this cookie automatically.
    # We ignore the cookie on such requests: they still go through, but as from a visitor
    # who isn't signed in.
    #
    # @param request [ActionDispatch::Request, Rack::Request]
    # @return [String, nil]
    def read(request)
      return unless TRUSTED_FETCH_SITES.include?(request.get_header('HTTP_SEC_FETCH_SITE'))

      request.cookies[NAME].presence
    end

    # @param expires [Time, nil] nil makes it a session cookie, removed when the browser closes.
    def write(response, token, expires: nil)
      response.set_cookie(NAME, attributes.merge(value: token, expires: expires).compact)
      clear_legacy(response)
    end

    def clear(response)
      response.delete_cookie(NAME, attributes)
      clear_legacy(response)
    end

    def attributes
      {
        path: '/',
        httponly: true,
        # Browsers drop Secure cookies received over plain http, which local development
        # and the e2e setup use.
        secure: !Rails.env.local?,
        # Strict would not be sent when an SSO provider redirects the user back to us.
        same_site: :lax
      }
    end

    def clear_legacy(response)
      response.delete_cookie(LEGACY_NAME, path: '/')
    end
  end
end
