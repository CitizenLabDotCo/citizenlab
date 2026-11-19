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

    # Companion cookie that the front-end can read, to know right away whether the user
    # is signed in. It holds no secret, only `true`. Set and cleared together with the
    # auth cookie, with the same expiry, so the browser drops both at the same time.
    # It is only a hint: the API never reads it, and doesn't check whether the token
    # is still valid.
    SIGNED_IN_NAME = 'cl2_signed_in'

    module_function

    # Protection against CSRF. A page on another website, or on another subdomain of ours
    # (which the cookie's SameSite setting doesn't stop), can make the user's browser send
    # a request here, and the browser then attaches this cookie automatically. We ignore
    # the cookie on such requests: they still go through, but as from a visitor who isn't
    # signed in. (Such requests that could change something are rejected before they get
    # here, see CrossSiteRequestGuard.)
    #
    # @param request [ActionDispatch::Request, Rack::Request]
    # @return [String, nil]
    def read(request)
      return if RequestOrigin.other_site?(request)

      request.cookies[NAME].presence
    end

    # @param expires [Time, nil] nil makes it a session cookie, removed when the browser closes.
    def write(response, token, expires: nil)
      response.set_cookie(NAME, attributes.merge(value: token, expires: expires).compact)
      response.set_cookie(SIGNED_IN_NAME, signed_in_attributes.merge(value: 'true', expires: expires).compact)
      clear_legacy(response)
    end

    def clear(response)
      response.delete_cookie(NAME, attributes)
      response.delete_cookie(SIGNED_IN_NAME, signed_in_attributes)
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

    def signed_in_attributes
      attributes.merge(httponly: false)
    end

    def clear_legacy(response)
      response.delete_cookie(LEGACY_NAME, path: '/')
    end
  end
end
