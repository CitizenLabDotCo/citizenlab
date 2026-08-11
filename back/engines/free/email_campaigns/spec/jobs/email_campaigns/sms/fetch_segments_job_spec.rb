# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::FetchSegmentsJob do
  describe '#handle_error' do
    it 'retries transient provider errors instead of expiring the job' do
      job = described_class.new
      allow(job).to receive_messages(error_count: 0, maximum_retry_count: 5)
      expect(job).not_to receive(:expire)

      job.send(:handle_error, EmailCampaigns::Sms::ProviderError::RateLimit.new('slow down'))
    end

    it 'expires the job for every other error' do
      [
        EmailCampaigns::Sms::ProviderError.new('unknown message'),
        ActiveRecord::RecordNotFound.new('delivery is gone')
      ].each do |error|
        job = described_class.new
        expect(job).to receive(:expire)

        job.send(:handle_error, error)
      end
    end
  end
end
