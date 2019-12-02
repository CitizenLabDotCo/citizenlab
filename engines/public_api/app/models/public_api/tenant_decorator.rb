module PublicApi::TenantDecorator
  extend ActiveSupport::Concern

  included do
    has_many :api_tokens, class_name: 'PublicApi::ApiClient', dependent: :destroy
  end

end