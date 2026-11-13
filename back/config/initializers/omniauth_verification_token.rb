# frozen_string_literal: true

# When a signed-in user verifies their identity through an SSO provider, OmniauthCallbackController
# needs to know who they are once the provider sends them back. It finds out from the `token`
# omniauth param, which the strategies carry through the provider round trip (in the session, or in
# the SAML RelayState for providers that post back cross-site and so don't get our cookies).
#
# The front-end can't read the auth token, so it only asks for verification with `verification=true`.
# This middleware then adds the token from the auth cookie as the `token` param, before OmniAuth
# stores the request params. Any `token` param sent by the client is dropped: only the signed-in
# user's own token may turn an SSO round trip into a verification.
class OmniauthVerificationToken
  REQUEST_PHASE_PATH = %r{\A/auth/[^/]+\z}

  def initialize(app)
    @app = app
  end

  def call(env)
    rewrite_query(env) if REQUEST_PHASE_PATH.match?(env['PATH_INFO'])
    @app.call(env)
  end

  private

  def rewrite_query(env)
    query = Rack::Utils.parse_nested_query(env['QUERY_STRING'])
    return unless query.key?('token') || query.key?('verification')

    query.delete('token')
    if query.delete('verification') == 'true'
      token = AuthToken::Cookie.read(Rack::Request.new(env))
      query['token'] = token if token
    end

    env['QUERY_STRING'] = Rack::Utils.build_nested_query(query)
  end
end

# Before the OmniAuth::Builder middlewares, registered by the engines' initializers, which run first.
Rails.application.config.middleware.insert_before OmniAuth::Builder, OmniauthVerificationToken
