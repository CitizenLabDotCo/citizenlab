# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Matomo::RemoveUserFromMatomoJob do
  subject(:job) { described_class.new }

  let(:user_id) { 'user-id' }

  describe '.tenant_site_ids' do
    it 'returns the sites configured for the tenant' do
      settings = AppConfiguration.instance.settings
      settings['matomo'] = { 'allowed' => true, 'enabled' => true, 'tenant_site_id' => '13', 'product_site_id' => '14' }
      AppConfiguration.instance.update!(settings: settings)

      expect(described_class.tenant_site_ids).to eq(%w[13 14])
    end

    it 'leaves out sites that are not configured' do
      settings = AppConfiguration.instance.settings
      settings['matomo'] = { 'allowed' => true, 'enabled' => true, 'tenant_site_id' => '', 'product_site_id' => '14' }
      AppConfiguration.instance.update!(settings: settings)

      expect(described_class.tenant_site_ids).to eq(%w[14])
    end
  end

  describe '#perform' do
    it 'uses Matomo::Client to remove user data' do
      matomo_client = instance_spy(Matomo::Client, 'matomo_client')
      allow(Matomo::Client).to receive(:new).and_return(matomo_client)

      job.perform(user_id, site_ids: %w[13 14])

      expect(matomo_client).to have_received(:delete_user_data).with(user_id, site_ids: %w[13 14])
    end

    it 'searches all sites for jobs that were enqueued without sites' do
      matomo_client = instance_spy(Matomo::Client, 'matomo_client')
      allow(Matomo::Client).to receive(:new).and_return(matomo_client)

      job.perform(user_id)

      expect(matomo_client).to have_received(:delete_user_data).with(user_id, site_ids: nil)
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

    it 'raises other Matomo errors right away' do
      matomo_client = instance_double(Matomo::Client)
      allow(Matomo::Client).to receive(:new).and_return(matomo_client)
      allow(matomo_client).to receive(:delete_user_data).and_raise(Matomo::Client::MatomoApiError, 'bad token')
      allow(Que).to receive(:execute)

      Thread.current[:que_current_job] = Que::Job.new(id: 1, error_count: 0)
      expect { job.perform(user_id) }.to raise_error(Matomo::Client::MatomoApiError, 'bad token')
    ensure
      Thread.current[:que_current_job] = nil
    end

    context 'when Matomo is over its concurrency cap' do
      let(:max_retries) { Que::Job.maximum_retry_count }
      let(:que_job) { Que::Job.new(id: 1, error_count: error_count) }

      before do
        matomo_client = instance_double(Matomo::Client)
        allow(Matomo::Client).to receive(:new).and_return(matomo_client)
        allow(matomo_client).to receive(:delete_user_data).and_raise(Matomo::Client::ServiceUnavailableError, '503')

        allow(Que).to receive(:execute)
        allow(Que).to receive(:notify_error)
      end

      # Runs the job as a Que worker does, where `que_job` is the row being worked.
      def perform_through_que
        Thread.current[:que_current_job] = que_job
        job.perform(user_id)
      ensure
        Thread.current[:que_current_job] = nil
      end

      context 'when retries are left' do
        let(:error_count) { 2 }

        it 'reschedules the job without raising' do
          expect { perform_through_que }.not_to raise_error
          expect(Que).not_to have_received(:notify_error)
        end

        it 'waits as long as after a raised error' do
          perform_through_que

          # The retry interval for an error count of 3 is 744 seconds plus some jitter.
          expect(Que).to have_received(:execute).with(
            :set_error,
            [a_value_between(744, 864), 'Matomo::Client::ServiceUnavailableError: 503', a_kind_of(String), 1]
          )
        end
      end

      context 'when it is the last attempt' do
        let(:error_count) { max_retries }

        it 'raises and expires the job' do
          expect { perform_through_que }.to raise_error(Matomo::Client::ServiceUnavailableError)
          expect(Que).to have_received(:execute).with(:expire_job, [1])
        end
      end

      it 'raises when the job does not run through Que' do
        expect { job.perform(user_id) }.to raise_error(Matomo::Client::ServiceUnavailableError)
      end
    end
  end
end
