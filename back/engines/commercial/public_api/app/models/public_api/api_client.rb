# frozen_string_literal: true

# == Schema Information
#
# Table name: public_api_api_clients
#
#  id             :uuid             not null, primary key
#  name           :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  last_used_at   :datetime
#  secret_digest  :string           not null
#  secret_postfix :string           not null
#
module PublicApi
  class ApiClient < ApplicationRecord
    validates :secret, presence: true, length: { minimum: 20 }

    before_validation :generate_secret, on: :create
    before_validation :generate_secret_postix

    has_secure_password :secret

    def authenticate(secret)
      # Provided by has_secure_password
      !!authenticate_secret(secret)
    end

    def self.from_token_request(request)
      id = request.params['auth'] && request.params['auth']['client_id']
      find(id)
    end

    def self.from_token_payload(payload)
      find(payload['sub'])
    end

    def to_token_payload
      {
        sub: id,
        exp: 1.day.from_now.to_i
      }
    end

    def used!
      touch(:last_used_at)
    end

    def generate_secret
      return if secret_digest.present?

      random_secret = SecureRandom.urlsafe_base64(50)
      self.secret = random_secret
      random_secret
    end

    def generate_secret_postix
      # has_secure_password sets @secret in case a new secret is assigned
      self.secret_postfix = @secret[-4..] if @secret
    end
  end
end
