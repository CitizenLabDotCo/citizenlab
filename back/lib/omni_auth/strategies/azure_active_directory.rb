# frozen_string_literal: true

# After https://github.com/AzureAD/omniauth-azure-activedirectory/blob/master/lib/omniauth/strategies/azure_activedirectory.rb.

# We decided to absorb omniauth-azure-activedirectory as it wasn't maintained
# since 2016. We could get rid of this if a better alternative pops up in the
# list of strategies: https://github.com/omniauth/omniauth/wiki/List-of-Strategies.

#-------------------------------------------------------------------------------
# Copyright (c) 2015 Micorosft Corporation
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#-------------------------------------------------------------------------------
module OmniAuth
  module Strategies
    # A strategy for authentication against Azure Active Directory.
    class AzureActiveDirectory
      include OmniAuth::Strategy

      ##
      # The client id (key) and tenant must be configured when the OmniAuth
      # middleware is installed. Example:
      #
      #    require 'omniauth'
      #    require 'omniauth-azure-activedirectory'
      #
      #    use OmniAuth::Builder do
      #      provider :azure_activedirectory, ENV['AAD_KEY'], ENV['AAD_TENANT']
      #    end
      #
      args %i[client_id tenant]
      option :client_id, nil
      option :tenant, nil

      # instead of hard coding client_id and tenant, you may pass a class that
      # determines these values at runtime to support multiple tenants
      option :tenant_provider, nil

      # points to the openid discovery json document. may also be set by the
      # tenant provider (just implement an openid_config_url method)
      #
      # Defaults to
      # "https://login.windows.net/#{tenant}/.well-known/openid-configuration"
      option :openid_config_url

      # URL parameter(s) to be used with the authorize_endpoint_url for triggering
      # display of the password reset page.may also be set by the
      # tenant provider (just implement the reset_password_param method)
      # This has to be a valid query string, i.e. "p=B2C_1_sipr"
      option :reset_password_param

      # Field renaming is an attempt to fit the OmniAuth recommended schema as
      # best as possible.
      #
      # @see https://github.com/intridea/omniauth/wiki/Auth-Hash-Schema
      uid { @claims['sub'] }
      info do
        { name: @claims['name'],
          email: @claims['email'] || @claims['upn'],
          first_name: @claims['given_name'],
          last_name: @claims['family_name'] }
      end
      credentials { { code: @code } }
      extra do
        { session_state: @session_state,
          raw_info:
            { id_token: @id_token,
              id_token_claims: @claims,
              id_token_header: @header } }
      end

      DEFAULT_RESPONSE_TYPE = 'code id_token'
      DEFAULT_RESPONSE_MODE = 'form_post'

      ##
      # Overridden method from OmniAuth::Strategy. This is called before
      # request_phase or callback_phase are called.
      def setup_phase
        if options.tenant_provider
          provider = options.tenant_provider.new(self)
          options.client_id = provider.client_id
          options.tenant = provider.tenant_id
          if provider.respond_to?(:openid_config_url)
            options.openid_config_url = provider.openid_config_url
          end
          if provider.respond_to?(:reset_password_param)
            options.reset_password_param = provider.reset_password_param
          end
        end

        super
      end

      ##
      # Overridden method from OmniAuth::Strategy. This is the first step in the
      # authentication process.
      def request_phase
        redirect authorize_endpoint_url
      end

      ##
      # Overridden method from OmniAuth::Strategy. This is the second step in
      # the authentication process. It is called after the user enters
      # credentials at the authorization endpoint.
      def callback_phase
        if (error = request.params['error_reason'] || request.params['error'])

          if error == 'access_denied' &&
             (desc = request.params['error_description']) &&
             desc =~ /^AADB2C90118:/

            return redirect reset_password_endpoint_url

          else
            return fail!(error) # invokes the configured on_failure handler and return its response
          end

        end

        @session_state = request.params['session_state']
        @id_token = request.params['id_token']
        @code = request.params['code']
        @claims, @header = validate_and_parse_id_token(@id_token)
        validate_chash(@code, @claims, @header)
        super
      end

      private

      ##
      # Constructs a one-time-use authorize_endpoint. This method will use
      # a new nonce on each invocation.
      #
      # @return String
      def authorize_endpoint_url
        uri = URI(openid_config['authorization_endpoint'])
        params = {
          client_id: client_id,
          scope: 'openid',
          redirect_uri: redirect_uri,
          response_mode: response_mode,
          response_type: response_type,
          nonce: new_nonce
        }.to_a
        # preserve existing URL params
        params += URI.decode_www_form(String(uri.query)) if uri.query
        uri.query = URI.encode_www_form(params)
        uri.to_s
      end

      ##
      # URL of the Azure password reset page
      #
      def reset_password_endpoint_url
        if (query_string = options['reset_password_param'])
          uri = URI(authorize_endpoint_url)
          reset_password_param = URI.decode_www_form(query_string).to_h
          params = URI.decode_www_form(String(uri.query)).to_h
          params.update reset_password_param
          uri.query = URI.encode_www_form params.to_a
          uri.to_s
        else
          authorize_endpoint_url
        end
      end

      def redirect_uri
        options[:redirect_uri] || callback_url
      end

      def callback_url
        full_host + script_name + callback_path
      end

      ##
      # The client id of the calling application. This must be configured where
      # AzureAD is installed as an OmniAuth strategy.
      #
      # @return String
      def client_id
        return options.client_id if options.client_id

        raise StandardError, 'No client_id specified in AzureAD configuration.'
      end

      ##
      # The expected id token issuer taken from the discovery endpoint.
      #
      # @return String
      def issuer
        openid_config['issuer']
      end

      ##
      # Fetches the current signing keys for Azure AD. Note that there should
      # always two available, and that they have a 6 week rollover.
      #
      # Each key is a hash with the following fields:
      #   kty, use, kid, x5t, n, e, x5c
      #
      # @return Array[Hash]
      def fetch_signing_keys
        response = JSON.parse(Net::HTTP.get(URI(signing_keys_url)))
        response['keys']
      rescue JSON::ParserError
        raise StandardError, 'Unable to fetch AzureAD signing keys.'
      end

      ##
      # Fetches the OpenId Connect configuration for the AzureAD tenant. This
      # contains several import values, including:
      #
      #   authorization_endpoint
      #   token_endpoint
      #   token_endpoint_auth_methods_supported
      #   jwks_uri
      #   response_types_supported
      #   response_modes_supported
      #   subject_types_supported
      #   id_token_signing_alg_values_supported
      #   scopes_supported
      #   issuer
      #   claims_supported
      #   microsoft_multi_refresh_token
      #   check_session_iframe
      #   end_session_endpoint
      #   userinfo_endpoint
      #
      # @return Hash
      def fetch_openid_config
        JSON.parse(Net::HTTP.get(URI(openid_config_url)))
      rescue JSON::ParserError
        raise StandardError, 'Unable to fetch OpenId configuration for ' \
                             'AzureAD tenant.'
      end

      ##
      # Generates a new nonce for one time use. Stores it in the session so
      # multiple users don't share nonces. All nonces should be generated by
      # this method.
      #
      # @return String
      def new_nonce
        session['omniauth-azure-activedirectory.nonce'] = SecureRandom.uuid
      end

      ##
      # A memoized version of #fetch_openid_config.
      #
      # @return Hash
      def openid_config
        @openid_config ||= fetch_openid_config
      end

      ##
      # The location of the OpenID configuration for the tenant.
      #
      # @return String
      def openid_config_url
        options[:openid_config_url] ||
          "https://login.windows.net/#{tenant}/.well-known/openid-configuration"
      end

      ##
      # Returns the most recent nonce for the session and deletes it from the
      # session.
      #
      # @return String
      def read_nonce
        session.delete('omniauth-azure-activedirectory.nonce')
      end

      ##
      # The response_type that will be set in the authorization request query
      # parameters. Can be overridden by the client, but it shouldn't need to
      # be.
      #
      # @return String
      def response_type
        options[:response_type] || DEFAULT_RESPONSE_TYPE
      end

      ##
      # The response_mode that will be set in the authorization request query
      # parameters. Can be overridden by the client, but it shouldn't need to
      # be.
      #
      # @return String
      def response_mode
        options[:response_mode] || DEFAULT_RESPONSE_MODE
      end

      ##
      # The keys used to sign the id token JWTs. This is just a memoized version
      # of #fetch_signing_keys.
      #
      # @return Array[Hash]
      def signing_keys
        @signing_keys ||= fetch_signing_keys
      end

      ##
      # The location of the public keys of the token signer. This is parsed from
      # the OpenId config response.
      #
      # @return String
      def signing_keys_url
        return openid_config['jwks_uri'] if openid_config.include? 'jwks_uri'

        raise StandardError, 'No jwks_uri in OpenId config response.'
      end

      ##
      # The tenant of the calling application. Note that this must be
      # explicitly configured when installing the AzureAD OmniAuth strategy.
      #
      # @return String
      def tenant
        return options.tenant if options.tenant

        raise StandardError, 'No tenant specified in AzureAD configuration.'
      end

      ##
      # Verifies the signature of the id token as well as the exp, nbf, iat,
      # iss, and aud fields.
      #
      # See OpenId Connect Core 3.1.3.7 and 3.2.2.11.
      #
      # @return Claims, Header
      def validate_and_parse_id_token(id_token)
        # The second parameter is the public key to verify the signature.
        # However, that key is overridden by the value of the executed block
        # if one is present.
        #
        # If you're thinking that this looks ugly with the raw nil and boolean,
        # see https://github.com/jwt/ruby-jwt/issues/59.
        jwt_claims, jwt_header =
          JWT.decode(id_token, nil, true, verify_options) do |header|
            # There should always be one key from the discovery endpoint that
            # matches the id in the JWT header.
            unless (key = signing_keys.find { |k| k['kid'] == header['kid'] })
              raise JWT::VerificationError, 'No keys from key endpoint match the id token'
            end

            # The key also contains other fields, such as n and e, that are
            # redundant. x5c is sufficient to verify the id token.
            if (x5c = key['x5c']) && !x5c.empty?
              OpenSSL::X509::Certificate.new(JWT::Base64.url_decode(x5c.first)).public_key
            # no x5c, so we resort to e and n
            elsif (exp = key['e']) && (mod = key['n'])
              key = OpenSSL::PKey::RSA.new
              mod = openssl_bn_for mod
              exp = openssl_bn_for exp
              if key.respond_to? :set_key
                # Ruby 2.4 ff
                key.set_key mod, exp, nil
              else
                # Ruby < 2.4
                key.e = exp
                key.n = mod
              end
              key.public_key
            else
              raise JWT::VerificationError, 'Key has no info for verification'
            end
          end
        return jwt_claims, jwt_header if jwt_claims['nonce'] == read_nonce

        raise JWT::DecodeError, 'Returned nonce did not match.'
      end

      def openssl_bn_for(s)
        s.strip!
        # Pad the string so its length is divisible by 4
        # this is necessary only with Ruby < 2.3, from then on
        # Base64.urlsafe_decode64 is clever enough to add the padding itself
        if !s.end_with?('=') && s.length % 4 != 0
          s = s.ljust((s.length + 3) & ~3, '=')
        end
        bytes = Base64.urlsafe_decode64 s
        OpenSSL::BN.new bytes, 2
      end

      ##
      # Verifies that the c_hash the id token claims matches the authorization
      # code. See OpenId Connect Core 3.3.2.11.
      #
      # @param String code
      # @param Hash claims
      # @param Hash header
      def validate_chash(code, claims, header)
        # This maps RS256 -> sha256, ES384 -> sha384, etc.
        algorithm = (header['alg'] || 'RS256').sub(/RS|ES|HS/, 'sha')
        full_hash = OpenSSL::Digest.new(algorithm).digest code
        c_hash = JWT::Base64.url_encode full_hash[0..((full_hash.length / 2) - 1)]
        return if c_hash == claims['c_hash']

        raise JWT::VerificationError, 'c_hash in id token does not match auth code.'
      end

      ##
      # The options passed to the Ruby JWT library to verify the id token.
      # Note that these are not all the checks we perform. Some (like nonce)
      # are not handled by the JWT API and are checked manually in
      # #validate_and_parse_id_token.
      #
      # @return Hash
      def verify_options
        { verify_expiration: true,
          algorithms: ['RS256'],
          verify_not_before: true,
          verify_iat: true,
          verify_iss: true,
          'iss' => issuer,
          verify_aud: true,
          'aud' => client_id }
      end
    end
  end
end
