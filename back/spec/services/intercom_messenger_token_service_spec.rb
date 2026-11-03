# frozen_string_literal: true

require 'rails_helper'

describe IntercomMessengerTokenService do
  subject(:service) { described_class.new }

  let(:secret) { 'intercom-messenger-secret' }
  let(:admin) { create(:admin) }

  def stub_secret(value)
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('INTERCOM_MESSENGER_SECRET', nil).and_return(value)
  end

  before { stub_secret(secret) }

  describe '#token' do
    it 'is signed with the secret using HS256 and contains the user and company claims' do
      tenant = Tenant.current
      config = AppConfiguration.instance
      config.settings['core']['organization_type'] = 'medium_city'
      config.settings['core']['lifecycle_stage'] = 'active'
      config.save!

      payload, header = JWT.decode(service.token(admin), secret, true, algorithm: 'HS256')

      expect(header['alg']).to eq 'HS256'
      expect(payload.except('exp')).to eq(
        'user_id' => admin.id,
        'email' => admin.email,
        'company' => {
          'company_id' => tenant.id,
          'name' => tenant.name,
          'tenantId' => tenant.id,
          'tenantName' => tenant.name,
          'tenantHost' => tenant.host,
          'tenantOrganizationType' => 'medium_city',
          'tenantLifecycleStage' => 'active'
        }
      )
    end

    it 'cannot be verified with another secret' do
      expect { JWT.decode(service.token(admin), 'other-secret', true, algorithm: 'HS256') }
        .to raise_error(JWT::VerificationError)
    end

    it 'expires after one hour' do
      freeze_time do
        payload, = JWT.decode(service.token(admin), secret, true, algorithm: 'HS256')
        expect(payload['exp']).to eq 1.hour.from_now.to_i
      end
    end

    it 'is rejected once expired' do
      token = service.token(admin)
      travel 1.hour + 1.second do
        expect { JWT.decode(token, secret, true, algorithm: 'HS256') }.to raise_error(JWT::ExpiredSignature)
      end
    end
  end

  describe '#configured?' do
    it 'is true when the secret is set' do
      expect(service.configured?).to be true
    end

    it 'is false when the secret is missing' do
      stub_secret(nil)
      expect(service.configured?).to be false
    end

    it 'is false when the secret is blank' do
      stub_secret('')
      expect(service.configured?).to be false
    end
  end
end
