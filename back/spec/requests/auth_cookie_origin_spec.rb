# frozen_string_literal: true

require 'rails_helper'

# The auth cookie only signs requests in when they come from our own page (CSRF protection).
RSpec.describe AuthToken::Cookie do
  let(:user) { create(:user) }
  let(:token) { AuthToken::AuthToken.new(payload: user.to_token_payload).token }

  def get_me(sec_fetch_site)
    get '/web_api/v1/users/me', headers: {
      'Cookie' => "#{AuthToken::Cookie::NAME}=#{token}",
      'Sec-Fetch-Site' => sec_fetch_site
    }
  end

  it 'signs in a request from our own page' do
    get_me('same-origin')

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.dig('data', 'id')).to eq(user.id)
  end

  it 'treats a request from another website as signed out' do
    get_me('cross-site')

    expect(response).to have_http_status(:unauthorized)
  end

  it 'treats a request from another subdomain as signed out' do
    get_me('same-site')

    expect(response).to have_http_status(:unauthorized)
  end
end
