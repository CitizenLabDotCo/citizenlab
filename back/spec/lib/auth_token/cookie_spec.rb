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
end
