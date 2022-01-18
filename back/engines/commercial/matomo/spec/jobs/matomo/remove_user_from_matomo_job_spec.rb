# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Matomo::RemoveUserFromMatomoJob do
  subject(:job) { described_class.new }

  let(:user_id) { 'user-id' }

  describe '#perform' do
    it 'uses Matomo::Client to remove user data' do
      matomo_client = instance_spy(Matomo::Client, 'matomo_client')
      allow(Matomo::Client).to receive(:new).and_return(matomo_client)

      job.perform(user_id)

      expect(matomo_client).to have_received(:delete_user_data).with(user_id)
    end

    it 'raises an error if MATOMO_HOST is configured but MATOMO_AUTHORIZATION_TOKEN is missing' do
      stubbed_env = ENV.to_h
                       .except('MATOMO_AUTHORIZATION_TOKEN')
                       .merge('MATOMO_HOST' => 'matomo.hq.citizenlab.co')
      stub_const('ENV', stubbed_env)

      expect { job.perform(user_id) }.to raise_error(Matomo::Client::MissingAuthorizationTokenError)
    end

    it 'does not raise an error if MATOMO_HOST is not configured' do
      stub_const('ENV', ENV.to_h.except('MATOMO_HOST'))
      expect { job.perform(user_id) }.not_to raise_error(Matomo::Client::MissingBaseUriError)
    end
  end
end
