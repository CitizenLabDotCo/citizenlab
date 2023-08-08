# frozen_string_literal: true

RSpec.shared_context 'common_auth' do
  before do
    api_token = PublicApi::ApiClient.create
    token = AuthToken::AuthToken.new(payload: api_token.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  authentication(
    :apiKey,
    'Authorization header',
    name: 'Authorization',
    description: 'JWT token provided by the authentication endpoint'
  )
end
