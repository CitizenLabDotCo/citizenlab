# frozen_string_literal: true

# == Schema Information
#
# Table name: public_api_api_clients
#
#  id         :uuid             not null, primary key
#  name       :string
#  secret     :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
module PublicApi
  class ApiClient < ApplicationRecord
    validates :secret, presence: true, length: { minimum: 20 }

    before_validation :generate_secret, on: :create

    def authenticate(secret)
      self.secret == secret
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

    private

    def generate_secret
      self.secret ||= SecureRandom.urlsafe_base64(50)
    end
  end
end
