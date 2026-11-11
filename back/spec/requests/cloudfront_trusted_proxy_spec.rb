# frozen_string_literal: true

require 'rails_helper'

describe CloudfrontTrustedProxyGuard do
  using RSpec::Parameterized::TableSyntax

  # CloudFront appends the viewer's IP to whatever X-Forwarded-For the client
  # sent, so the last entry is always a real IP and anything before it is
  # client-controlled.
  let(:viewer_ip) { '1.2.3.4' }
  let(:cloudfront_ip) { '130.176.0.1' }

  before do
    allow(Rails.application.config.cloudfront).to receive(:ips).and_return([IPAddr.new('130.176.0.0/16')])
  end

  def request_ip(forwarded_for)
    env = Rack::MockRequest.env_for('/', 'REMOTE_ADDR' => '10.0.0.1', 'HTTP_X_FORWARDED_FOR' => forwarded_for)
    Rack::Request.new(env).ip
  end

  where(:case_name, :client_header) do
    'no client header'            | nil
    'empty client header'         | ''
    'hostname in client header'   | 'localhost'
    'garbage in client header'    | 'unknown'
    'spoofed IP in client header' | '9.9.9.9'
  end

  with_them do
    let(:forwarded_for) { [client_header, viewer_ip].compact.join(', ') }

    it 'resolves the viewer IP' do
      expect(request_ip(forwarded_for)).to eq(viewer_ip)
    end
  end

  it 'still skips CloudFront IPs when resolving the client IP' do
    expect(request_ip("#{viewer_ip}, #{cloudfront_ip}")).to eq(viewer_ip)
  end

  context 'when an IP is safelisted in Rack::Attack' do
    before do
      Rack::Attack.enabled = true
      Rack::Attack.safelist_ip('9.9.9.9')
    end

    after do
      Rack::Attack.configuration.anonymous_safelists.pop
      Rack::Attack.enabled = false
    end

    it 'does not fail requests with an invalid X-Forwarded-For entry' do
      get '/web_api/v1/app_configuration', headers: { 'X-Forwarded-For' => ", #{viewer_ip}" }
      expect(response).to have_http_status(:ok)

      get '/web_api/v1/app_configuration', headers: { 'X-Forwarded-For' => "localhost, #{viewer_ip}" }
      expect(response).to have_http_status(:ok)
    end
  end
end
