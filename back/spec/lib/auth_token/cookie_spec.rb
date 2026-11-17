# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AuthToken::Cookie do
  describe '.read' do
    def read_cookie(sec_fetch_site)
      env = Rack::MockRequest.env_for('/web_api/v1/users/me')
      env['HTTP_COOKIE'] = "#{described_class::NAME}=abc"
      env['HTTP_SEC_FETCH_SITE'] = sec_fetch_site if sec_fetch_site
      described_class.read(Rack::Request.new(env))
    end

    it 'reads the cookie on requests from our own page' do
      expect(read_cookie('same-origin')).to eq('abc')
    end

    it 'reads the cookie when the user typed the address or used a bookmark' do
      expect(read_cookie('none')).to eq('abc')
    end

    it 'reads the cookie when the client does not send Sec-Fetch-Site' do
      expect(read_cookie(nil)).to eq('abc')
    end

    it 'ignores the cookie on requests from another website' do
      expect(read_cookie('cross-site')).to be_nil
    end

    it 'ignores the cookie on requests from another subdomain' do
      expect(read_cookie('same-site')).to be_nil
    end
  end

  describe '.write and .clear' do
    let(:response) { ActionDispatch::Response.new }

    # The Set-Cookie line for the cookie +name+.
    def cookie_header(name)
      lines = Array(response.headers['set-cookie']).flat_map { |header| header.split("\n") }
      lines.find { |line| line.start_with?("#{name}=") }
    end

    it 'sets the auth cookie, readable only by the browser, and the signed-in cookie, readable by the front-end' do
      expires = Time.utc(2030, 1, 2, 3, 4, 5)
      described_class.write(response, 'abc', expires: expires)

      auth = cookie_header(described_class::NAME)
      signed_in = cookie_header(described_class::SIGNED_IN_NAME)

      expect(auth).to start_with("#{described_class::NAME}=abc;")
      expect(auth).to match(/httponly/i)
      expect(signed_in).to start_with("#{described_class::SIGNED_IN_NAME}=true;")
      expect(signed_in).not_to match(/httponly/i)

      # Same expiry, so the browser drops both at the same time.
      expect([auth, signed_in]).to all(
        include('expires=Wed, 02 Jan 2030 03:04:05 GMT', 'path=/').and(match(/samesite=lax/i))
      )
    end

    it 'makes both session cookies when there is no expiry' do
      described_class.write(response, 'abc')

      expect(cookie_header(described_class::NAME)).not_to match(/expires=/i)
      expect(cookie_header(described_class::SIGNED_IN_NAME)).not_to match(/expires=/i)
    end

    it 'clears both cookies' do
      described_class.clear(response)

      expect(cookie_header(described_class::NAME)).to match(/max-age=0/i)
      expect(cookie_header(described_class::SIGNED_IN_NAME)).to match(/max-age=0/i)
    end
  end
end
