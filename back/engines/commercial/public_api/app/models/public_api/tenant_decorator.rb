# frozen_string_literal: true

module PublicApi::TenantDecorator
  extend ActiveSupport::Concern

  included do
    has_many :api_clients, class_name: 'PublicApi::ApiClient', dependent: :destroy
  end
end
