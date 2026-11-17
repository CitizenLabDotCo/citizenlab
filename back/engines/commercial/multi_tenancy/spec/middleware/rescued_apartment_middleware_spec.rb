# frozen_string_literal: true

require 'rails_helper'

# The middleware subclasses an Apartment elevator and relies on its internals, so these specs
# guard tenant switching across Apartment and Rails upgrades.
RSpec.describe RescuedApartmentMiddleware do
  subject(:middleware) { described_class.new(app) }

  let(:observed_tenants) { [] }
  let(:app) do
    lambda do |_env|
      observed_tenants << Apartment::Tenant.current
      [200, {}, ['OK']]
    end
  end

  def call(url)
    middleware.call(Rack::MockRequest.env_for(url))
  end

  before { Apartment::Tenant.switch!('public') }

  it "switches to the tenant of the request's host" do
    call('http://example.org/web_api/v1/app_configuration')

    expect(observed_tenants).to eq(['example_org'])
  end

  it 'restores the previous tenant after the request' do
    call('http://example.org/web_api/v1/app_configuration')

    expect(Apartment::Tenant.current).to eq('public')
  end

  it 'still calls the app when the host matches no tenant' do
    status, = call('http://unknown-host.example.com/web_api/v1/app_configuration')

    expect(status).to eq(200)
    expect(observed_tenants).to eq(['public'])
  end

  where(:path) do
    ['/admin_api/tenants', '/okcomputer', '/okcomputer/all', '/hooks/mailgun_events']
  end

  with_them do
    it 'does not switch tenant' do
      call("http://example.org#{path}")

      expect(observed_tenants).to eq(['public'])
    end
  end

  it 'runs after the session middleware' do
    stack = Rails.application.middleware.map(&:klass)

    expect(stack.index(described_class)).to eq(stack.index(ActionDispatch::Session::CookieStore) + 1)
  end
end
