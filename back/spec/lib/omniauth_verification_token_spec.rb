# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OmniauthVerificationToken do
  subject(:middleware) { described_class.new(app) }

  let(:app) { ->(env) { [200, {}, [env['QUERY_STRING']]] } }

  def query_passed_on(path, query, cookie: nil, sec_fetch_site: nil)
    env = Rack::MockRequest.env_for("#{path}?#{query}")
    env['HTTP_COOKIE'] = "#{AuthToken::Cookie::NAME}=#{cookie}" if cookie
    env['HTTP_SEC_FETCH_SITE'] = sec_fetch_site if sec_fetch_site
    Rack::Utils.parse_nested_query(middleware.call(env)[2].first)
  end

  it 'adds the token from the auth cookie when verification is requested' do
    query = query_passed_on('/auth/clave_unica', 'verification=true&verification_pathname=/page', cookie: 'abc')

    expect(query).to eq('token' => 'abc', 'verification_pathname' => '/page')
  end

  # A link on another website must not start a verification for the signed-in user.
  it 'does not add a token when the request comes from another website' do
    query = query_passed_on('/auth/clave_unica', 'verification=true', cookie: 'abc', sec_fetch_site: 'cross-site')

    expect(query).to eq({})
  end

  it 'does not add a token when there is no auth cookie' do
    expect(query_passed_on('/auth/clave_unica', 'verification=true')).to eq({})
  end

  it 'does not add a token when verification is not requested' do
    expect(query_passed_on('/auth/clave_unica', 'sso_pathname=/page', cookie: 'abc')).to eq('sso_pathname' => '/page')
  end

  it 'drops a token sent by the client' do
    query = query_passed_on('/auth/clave_unica', 'token=forged', cookie: 'abc')
    expect(query).to eq({})

    query = query_passed_on('/auth/clave_unica', 'verification=true&token=forged', cookie: 'abc')
    expect(query).to eq('token' => 'abc')
  end

  it 'keeps nested params' do
    query = query_passed_on('/auth/google', 'verification=true&claim_tokens[]=a&claim_tokens[]=b', cookie: 'abc')

    expect(query).to eq('token' => 'abc', 'claim_tokens' => %w[a b])
  end

  it 'leaves callbacks and other paths alone' do
    expect(query_passed_on('/auth/clave_unica/callback', 'token=x&verification=true')).to eq('token' => 'x', 'verification' => 'true')
    expect(query_passed_on('/web_api/v1/users/me', 'token=x')).to eq('token' => 'x')
  end
end
