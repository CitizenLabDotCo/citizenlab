# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Matomo::RemoveUserFromMatomoJob do
  subject(:job) { described_class.new }

  let(:user_id) { 'user-id' }

  def configure_sites(tenant_site_id:, product_site_id:)
    settings = AppConfiguration.instance.settings
    settings['matomo'] = { 'allowed' => true, 'enabled' => true, 'tenant_site_id' => tenant_site_id, 'product_site_id' => product_site_id }
    AppConfiguration.instance.update!(settings: settings)
  end

  describe '#perform' do
    let(:matomo_client) { instance_spy(Matomo::Client, 'matomo_client') }

    before do
      allow(Matomo::Client).to receive(:new).and_return(matomo_client)
      configure_sites(tenant_site_id: '13', product_site_id: '14')
    end

    it 'uses Matomo::Client to remove user data from the sites of the tenant' do
      job.perform(user_id)

      expect(matomo_client).to have_received(:delete_user_data).with(user_id, site_ids: %w[13 14])
    end

    it 'removes the data of all the users with one call when given a list of ids' do
      job.perform(%w[user-1 user-2])

      expect(matomo_client).to have_received(:delete_user_data).once.with(%w[user-1 user-2], site_ids: %w[13 14])
    end

    it 'leaves out the sites that are not configured' do
      configure_sites(tenant_site_id: '', product_site_id: '14')

      job.perform(user_id)

      expect(matomo_client).to have_received(:delete_user_data).with(user_id, site_ids: %w[14])
    end

    it 'raises an error if MATOMO_HOST is configured but MATOMO_AUTHORIZATION_TOKEN is missing' do
      allow(Matomo::Client).to receive(:new).and_call_original
      stubbed_env = ENV.to_h
        .except('MATOMO_AUTHORIZATION_TOKEN')
        .merge('MATOMO_HOST' => 'matomo.hq.citizenlab.co')
      stub_const('ENV', stubbed_env)

      expect { job.perform(user_id) }.to raise_error(Matomo::Client::MissingAuthorizationTokenError)
    end

    it 'does not raise an error if MATOMO_HOST is not configured' do
      allow(Matomo::Client).to receive(:new).and_call_original
      stub_const('ENV', ENV.to_h.except('MATOMO_HOST'))
      expect { job.perform(user_id) }.not_to raise_error(Matomo::Client::MissingBaseUriError)
    end
  end
end
