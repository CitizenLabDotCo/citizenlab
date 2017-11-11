Tenant.class_eval do

  has_many :api_tokens, class_name: 'PublicApi::ApiToken', dependent: :destroy

end