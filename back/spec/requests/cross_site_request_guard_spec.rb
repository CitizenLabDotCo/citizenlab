# frozen_string_literal: true

require 'rails_helper'

# Requests from another website or subdomain that could change something are rejected
# (CSRF protection), whether or not the browser is signed in.
RSpec.describe CrossSiteRequestGuard do
  let(:password) { 'democracy2.0' }
  let!(:user) { create(:user, password: password) }
  let(:own_origin) { "http://#{host}" } # The host the request specs send to.

  # A plain HTML form on another website, posting to the sign-in endpoint (login CSRF).
  def post_sign_in_form(headers)
    post '/web_api/v1/user_token',
      params: { auth: { email: user.email, password: password } },
      headers: { 'Content-Type' => 'application/x-www-form-urlencoded' }.merge(headers)
  end

  def sign_in_cookie_set?
    Array(response.headers['set-cookie']).join("\n").include?("#{AuthToken::Cookie::NAME}=")
  end

  it 'rejects a sign-in from another website, without signing the browser in' do
    post_sign_in_form('Sec-Fetch-Site' => 'cross-site', 'Origin' => 'https://attacker.example')

    expect(response).to have_http_status(:forbidden)
    expect(sign_in_cookie_set?).to be(false)
  end

  it 'rejects a sign-in from another subdomain' do
    post_sign_in_form('Sec-Fetch-Site' => 'same-site', 'Origin' => 'https://other.example.org')

    expect(response).to have_http_status(:forbidden)
  end

  it 'rejects a sign-in from another website in a browser that does not send Sec-Fetch-Site' do
    post_sign_in_form('Origin' => 'https://attacker.example')

    expect(response).to have_http_status(:forbidden)
  end

  it 'rejects a request with an opaque origin (sandboxed iframe)' do
    post_sign_in_form('Origin' => 'null')

    expect(response).to have_http_status(:forbidden)
  end

  it 'rejects other requests that change something, such as confirming a code' do
    post '/web_api/v1/user/confirm_code_email',
      params: { confirmation: { email: user.email, code: '123456' } },
      headers: { 'Sec-Fetch-Site' => 'cross-site' }

    expect(response).to have_http_status(:forbidden)
  end

  it 'rejects the start of an SSO flow posted from another website' do
    post '/auth/google', headers: { 'Sec-Fetch-Site' => 'cross-site' }

    expect(response).to have_http_status(:forbidden)
  end

  it 'lets an identity provider post the user back to us from its own website' do
    post '/auth/failure', headers: { 'Sec-Fetch-Site' => 'cross-site' }

    expect(response).not_to have_http_status(:forbidden)
  end

  it 'signs in from our own page' do
    post_sign_in_form('Sec-Fetch-Site' => 'same-origin', 'Origin' => own_origin)

    expect(response).to have_http_status(:created)
    expect(sign_in_cookie_set?).to be(true)
  end

  it 'signs in from our own page in a browser that does not send Sec-Fetch-Site' do
    post_sign_in_form('Origin' => own_origin)

    expect(response).to have_http_status(:created)
  end

  it 'accepts requests from clients that are not browsers (no Sec-Fetch-Site, no Origin)' do
    post_sign_in_form({})

    expect(response).to have_http_status(:created)
  end

  it 'lets GET requests from another website through' do
    get '/web_api/v1/app_configuration', headers: { 'Sec-Fetch-Site' => 'cross-site' }

    expect(response).to have_http_status(:ok)
  end
end
