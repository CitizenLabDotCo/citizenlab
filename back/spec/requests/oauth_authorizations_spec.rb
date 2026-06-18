# frozen_string_literal: true

require 'rails_helper'

# Request specs for the SPA-facing OAuth consent endpoint that replaced
# Doorkeeper's HTML authorize screen. See
# WebApi::V1::OauthAuthorizationsController.
describe WebApi::V1::OauthAuthorizationsController do
  let(:user) { create(:admin) }
  let(:application) do
    Doorkeeper::Application.create!(
      name: 'Test MCP Client',
      redirect_uri: 'https://client.example.com/oauth/callback',
      confidential: false
    )
  end
  let(:code_verifier) { 'a' * 64 }
  let(:code_challenge) do
    Base64.urlsafe_encode64(Digest::SHA256.digest(code_verifier), padding: false)
  end
  let(:valid_params) do
    {
      client_id: application.uid,
      response_type: 'code',
      redirect_uri: application.redirect_uri,
      scope: 'mcp:access',
      code_challenge: code_challenge,
      code_challenge_method: 'S256',
      state: 'state-123'
    }
  end
  let(:auth_headers) do
    { 'Authorization' => "Bearer #{AuthToken::AuthToken.new(payload: user.to_token_payload).token}" }
  end

  describe 'GET /web_api/v1/oauth_authorization' do
    it 'returns the client name, scopes and echoed params for a valid request' do
      get '/web_api/v1/oauth_authorization', params: valid_params, headers: auth_headers

      expect(response).to have_http_status(:ok)
      attrs = response.parsed_body.dig('data', 'attributes')
      expect(attrs['client_name']).to eq('Test MCP Client')
      expect(attrs['scopes']).to eq(['mcp:access'])
      expect(attrs['redirect_uri']).to eq(application.redirect_uri)
      expect(attrs['params']).to include(
        'client_id' => application.uid,
        'code_challenge' => code_challenge,
        'code_challenge_method' => 'S256',
        'state' => 'state-123'
      )
    end

    it 'returns 401 when unauthenticated' do
      get '/web_api/v1/oauth_authorization', params: valid_params

      expect(response).to have_http_status(:unauthorized)
    end

    it 'returns an OAuth error for an invalid scope' do
      get '/web_api/v1/oauth_authorization', params: valid_params.merge(scope: 'not-a-scope'), headers: auth_headers

      expect(response).to have_http_status(:bad_request)
      expect(response.parsed_body['error']).to eq('invalid_scope')
    end

    it 'returns an OAuth error for an unknown client' do
      get '/web_api/v1/oauth_authorization', params: valid_params.merge(client_id: 'does-not-exist'), headers: auth_headers

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body['error']).to eq('invalid_client')
    end

    it 'returns an OAuth error when PKCE is missing (force_pkce)' do
      params = valid_params.except(:code_challenge, :code_challenge_method)
      get '/web_api/v1/oauth_authorization', params: params, headers: auth_headers

      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'POST /web_api/v1/oauth_authorization' do
    it 'creates a grant for the current user and returns the client redirect uri' do
      expect do
        post '/web_api/v1/oauth_authorization', params: valid_params, headers: auth_headers
      end.to change(Doorkeeper::AccessGrant, :count).by(1)

      expect(response).to have_http_status(:ok)
      redirect = response.parsed_body.dig('data', 'attributes', 'redirect_uri')
      expect(redirect).to start_with(application.redirect_uri)
      expect(redirect).to include('code=')
      expect(redirect).to include('state=state-123')

      grant = Doorkeeper::AccessGrant.last
      expect(grant.resource_owner_id).to eq(user.id)
      expect(grant.application_id).to eq(application.id)
      expect(grant.scopes.to_s).to eq('mcp:access')
    end

    it 'returns 401 when unauthenticated' do
      expect do
        post '/web_api/v1/oauth_authorization', params: valid_params
      end.not_to change(Doorkeeper::AccessGrant, :count)

      expect(response).to have_http_status(:unauthorized)
    end

    it 'does not create a grant for an invalid request' do
      expect do
        post '/web_api/v1/oauth_authorization', params: valid_params.merge(scope: 'not-a-scope'), headers: auth_headers
      end.not_to change(Doorkeeper::AccessGrant, :count)

      expect(response).to have_http_status(:bad_request)
    end
  end
end
