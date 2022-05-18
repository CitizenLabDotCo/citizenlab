# frozen_string_literal: true

# == Schema Information
#
# Table name: public.public_api_api_clients
#
#  id         :uuid             not null, primary key
#  name       :string
#  secret     :string
#  tenant_id  :uuid
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_public_api_api_clients_on_tenant_id  (tenant_id)
#
# Foreign Keys
#
#  fk_rails_...  (tenant_id => tenants.id)
#
module PublicApi
  class ApiClient < ApplicationRecord
    belongs_to :tenant, optional: true

    validates :secret, presence: true, length: { minimum: 20 }

    before_validation :generate_secret, on: :create

    def authenticate(secret)
      rights_for_tenant = tenant_id.nil? || tenant_id == Tenant.current.id
      self.secret == secret && rights_for_tenant
    end

    def self.from_token_request(request)
      id = request.params['auth'] && request.params['auth']['client_id']
      find(id)
    end

    def self.from_token_payload(payload)
      if payload['tenant_id']
        find_by(id: payload['sub'], tenant_id: payload['tenant_id'])
      else
        find(payload['sub'])
      end
    end

    def to_token_payload
      {
        sub: id,
        tenant_id: tenant_id,
        exp: 1.day.from_now.to_i
      }
    end

    private

    def generate_secret
      self.secret ||= SecureRandom.urlsafe_base64(50)
    end
  end
end
