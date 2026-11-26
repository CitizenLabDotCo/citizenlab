# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PosthogIntegration::RemoveUserFromPosthogJob do
  subject(:job) { described_class.new }

  let(:user_id) { 'user-id' }

  describe '#perform' do
    context 'when PostHog integration is configured' do
      # PostHog integration is configured means that POSTHOG_CUSTOM_CLIENT is defined.
      let!(:posthog_client) do
        stub_const(
          'POSTHOG_CUSTOM_CLIENT',
          instance_spy(PosthogIntegration::PostHog::Client)
        )
      end

      it 'uses PosthogIntegration::PostHog::Client to remove user data' do
        job.perform(user_id)

        expect(posthog_client)
          .to have_received(:delete_persons_by_distinct_ids).with([user_id], retries: 10)
      end

      it 'removes all the users with one call when given a list of ids' do
        job.perform(%w[user-1 user-2])

        expect(posthog_client).to have_received(:delete_persons_by_distinct_ids).once.with(%w[user-1 user-2], retries: 10)
      end
    end

    context 'when PostHog integration is not configured' do
      before do
        stub_const('POSTHOG_CUSTOM_CLIENT', nil)
      end

      it 'does not remove user data from PostHog' do
        expect_any_instance_of(PosthogIntegration::PostHog::Client)
          .not_to receive(:delete_persons_by_distinct_ids)

        job.perform(user_id)
      end
    end
  end
end
