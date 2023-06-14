# frozen_string_literal: true

require 'rails_helper'

# After https://github.com/nsarno/knock/blob/master/test/model/knock/auth_token_test.rb.
describe AuthToken::AuthToken do
  let(:token_signature_algorithm) { 'RS256' }
  let(:rsa_private) { described_class::TOKEN_SECRET_SIGNATURE_KEY.call }
  let(:token) { JWT.encode({ sub: '1' }, rsa_private, token_signature_algorithm) }

  describe do
    let(:token_signature_algorithm) { 'HS256' }
    let(:rsa_private) { Rails.application.secrets.secret_key_base }

    it 'verifies the algorithm' do
      expect { described_class.new(token: token) }.to raise_error(JWT::IncorrectAlgorithm)
    end
  end

  it 'decodes RSA encoded tokens' do
    expect { described_class.new(token: token) }.not_to raise_error
  end

  it 'encodes tokens with RSA' do
    token = described_class.new(payload: { sub: '1' }).token

    payload, header = JWT.decode token, described_class::TOKEN_PUBLIC_KEY, true, { algorithm: 'RS256' }
    expect(payload['sub']).to eq '1'
    expect(header['alg']).to eq 'RS256'
  end

  it 'validates the expiration claim' do
    token = described_class.new(payload: { sub: 'foo' }).token
    travel_to(35.days.from_now) do
      expect { described_class.new(token: token) }.to raise_error(JWT::ExpiredSignature)
    end
  end

  it 'has all payloads' do
    payload = described_class.new(payload: { sub: 'foo' }).payload
    expect(payload).to have_key(:sub)
    expect(payload).to have_key(:exp)
  end
end
