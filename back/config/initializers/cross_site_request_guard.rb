# frozen_string_literal: true

# Rejects every request from another website or another subdomain of ours that could
# change something (anything but GET, HEAD and OPTIONS), on every endpoint, whether or
# not the user is signed in (CSRF protection). Without it, a form on another website
# could make the visitor's browser post to us: for instance to sign the visitor in to
# the attacker's account (login CSRF), since signing in sets the auth cookie.
#
# GET requests from other websites go through (links, SSO redirects, crawlers), but
# AuthToken::Cookie.read ignores the auth cookie on them, so they act as a visitor who
# isn't signed in.
#
# This is a middleware rather than a controller filter so it also covers the OmniAuth
# request phase (`POST /auth/:provider`), which OmniAuth handles before any controller.
class CrossSiteRequestGuard
  SAFE_METHODS = %w[GET HEAD OPTIONS].freeze

  # Identity providers send the user back to these from their own website, some of them
  # with a form post (SAML, Azure AD form_post, ...). None of them reads the auth cookie.
  SSO_RETURN_PATH = %r{\A/auth/(failure|[^/]+/(callback|slo))\z}

  def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env)
    return @app.call(env) if allowed?(request)

    Rails.logger.info(
      message: 'Rejected a request from another website',
      method: request.request_method,
      path: request.path,
      sec_fetch_site: request.get_header('HTTP_SEC_FETCH_SITE'),
      origin: request.get_header('HTTP_ORIGIN')
    )
    [403, { 'content-type' => 'application/json' }, ['{"errors":{"base":[{"error":"cross_site_request"}]}}']]
  end

  private

  def allowed?(request)
    SAFE_METHODS.include?(request.request_method) ||
      SSO_RETURN_PATH.match?(request.path_info) ||
      !RequestOrigin.other_site?(request)
  end
end

# Early, before OmniAuth (whose middlewares come after the session) and the controllers.
Rails.application.config.middleware.insert_before ActionDispatch::Cookies, CrossSiteRequestGuard
