# frozen_string_literal: true

# After https://github.com/nsarno/knock/blob/master/app/model/knock/auth_token.rb.
module AuthToken
  class AuthToken
    TOKEN_SIGNATURE_ALGORITHM = 'RS256'
    TOKEN_LIFETIME = 30.days
    TOKEN_PUBLIC_KEY = OpenSSL::PKey::RSA.new(ENV.fetch('JWT_RS256_PUBLIC_KEY').gsub('\n', "\n"))
    TOKEN_SECRET_SIGNATURE_KEY = -> { OpenSSL::PKey::RSA.new(ENV.fetch('JWT_RS256_PRIVATE_KEY').gsub('\n', "\n")) }

    attr_reader :token, :payload

    def initialize(payload: {}, token: nil)
      if token.present?
        @payload, = JWT.decode token.to_s, TOKEN_PUBLIC_KEY, true, decode_token_options
        @token = token
      else
        @payload = { exp: TOKEN_LIFETIME.from_now.to_i }.merge(payload)
        @token = JWT.encode @payload, secret_key, TOKEN_SIGNATURE_ALGORITHM
      end
    end

    def entity_for(entity_class)
      if entity_class.respond_to? :from_token_payload
        entity_class.from_token_payload @payload
      else
        entity_class.find @payload['sub']
      end
    end

    def to_json(_options = {})
      { jwt: @token }.to_json
    end

    private

    def decode_token_options
      {
        verify_expiration: true,
        algorithm: TOKEN_SIGNATURE_ALGORITHM
      }
    end

    def secret_key
      TOKEN_SECRET_SIGNATURE_KEY.call
    end
  end
end
