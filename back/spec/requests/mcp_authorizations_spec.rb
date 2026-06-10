# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::McpAuthorizationsController do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:app1) do
    Doorkeeper::Application.create!(name: 'Acme Connector', redirect_uri: 'https://a.example.com/cb', confidential: false)
  end
  let(:app2) do
    Doorkeeper::Application.create!(name: 'Urban Insights', redirect_uri: 'https://b.example.com/cb', confidential: false)
  end
  let(:auth_headers) do
    { 'Authorization' => "Bearer #{AuthToken::AuthToken.new(payload: user.to_token_payload).token}" }
  end

  def create_token(owner, application, **opts)
    Doorkeeper::AccessToken.create!(
      resource_owner_id: owner.id, application: application, scopes: 'mcp:access', expires_in: 7200, **opts
    )
  end

  describe 'GET /web_api/v1/mcp_authorizations' do
    it "returns one row per client for the current user's non-revoked tokens" do
      create_token(user, app1)
      create_token(user, app1) # second token, same client -> still one row
      create_token(user, app2)
      create_token(other_user, app1) # another user's token -> excluded

      get '/web_api/v1/mcp_authorizations', headers: auth_headers

      expect(response).to have_http_status(:ok)
      data = response.parsed_body['data']
      expect(data.size).to eq(2)

      acme = data.find { |d| d.dig('attributes', 'client_name') == 'Acme Connector' }
      expect(acme['id']).to eq(app1.id)
      expect(acme['type']).to eq('mcp_authorization')
      expect(acme.dig('attributes', 'client_id')).to eq(app1.uid)
    end

    it 'excludes revoked tokens' do
      create_token(user, app1, revoked_at: Time.current)

      get '/web_api/v1/mcp_authorizations', headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['data']).to be_empty
    end

    it 'returns 401 when unauthenticated' do
      get '/web_api/v1/mcp_authorizations'

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'DELETE /web_api/v1/mcp_authorizations/:id' do
    it "revokes all the current user's tokens and grants for that client only" do
      token1 = create_token(user, app1)
      token2 = create_token(user, app1)
      grant = Doorkeeper::AccessGrant.create!(
        resource_owner_id: user.id, application: app1, scopes: 'mcp:access',
        expires_in: 600, redirect_uri: app1.redirect_uri, token: SecureRandom.hex(16)
      )
      untouched = create_token(user, app2) # different client

      delete "/web_api/v1/mcp_authorizations/#{app1.id}", headers: auth_headers

      expect(response).to have_http_status(:no_content)
      expect(token1.reload.revoked_at).to be_present
      expect(token2.reload.revoked_at).to be_present
      expect(grant.reload.revoked_at).to be_present
      expect(untouched.reload.revoked_at).to be_nil
    end

    it "rejects revoking a client the current user hasn't authorized (no IDOR)" do
      other_token = create_token(other_user, app1) # current user has no token for app1

      delete "/web_api/v1/mcp_authorizations/#{app1.id}", headers: auth_headers

      expect(response).to have_http_status(:unauthorized)
      expect(other_token.reload.revoked_at).to be_nil
    end

    it 'returns 401 when unauthenticated' do
      delete "/web_api/v1/mcp_authorizations/#{app1.id}"

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
