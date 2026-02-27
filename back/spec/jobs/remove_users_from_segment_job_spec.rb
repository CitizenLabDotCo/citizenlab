# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RemoveUsersFromSegmentJob do
  subject(:job) { described_class.new }

  describe '#perform' do
    let(:user) { create(:user) }

    context 'when SEGMENT_CLIENT is configured' do
      # and thus, data is sent to Segment

      before do
        stub_const('SEGMENT_CLIENT', SimpleSegment::Client.new(write_key: 'dummy-write-key'))
      end

      it 'raises an error if the authorization token is missing' do
        stub_const('ENV', ENV.to_h.except('SEGMENT_AUTHORIZATION_TOKEN'))
        expect { job.perform([user.id]) }
          .to raise_error(SegmentRegulationsClient::MissingAuthorizationTokenError)
      end
    end

    context 'when SEGMENT_CLIENT is not configured' do
      before { hide_const('SEGMENT_CLIENT') }

      it 'does not raise an error if the authorization token is missing' do
        expect { job.perform([user.id]) }.not_to raise_error
      end
    end
  end
end
