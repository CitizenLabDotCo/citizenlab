# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::SendJob do
  describe '#run' do
    it "delivers the pending delivery through the send service using the recipient's confirmed phone" do
      user = create(:user, phone: '+14155552671')
      delivery = EmailCampaigns::Sms::Delivery.create!(body: 'hi', status: 'pending', user: user)
      send_service = instance_double(EmailCampaigns::Sms::SendService)
      allow(EmailCampaigns::Sms::SendService).to receive(:new).and_return(send_service)

      expect(send_service).to receive(:deliver).with(delivery, to: '+14155552671')

      described_class.new.run(delivery.id)
    end

    it 'delivers to an explicit `to` destination when given (e.g. the OTP new_phone)' do
      user = create(:user, phone: '+14155550000') # confirmed phone differs from the target
      delivery = EmailCampaigns::Sms::Delivery.create!(body: 'hi', status: 'pending', user: user)
      send_service = instance_double(EmailCampaigns::Sms::SendService)
      allow(EmailCampaigns::Sms::SendService).to receive(:new).and_return(send_service)

      expect(send_service).to receive(:deliver).with(delivery, to: '+14155552671')

      described_class.new.run(delivery.id, to: '+14155552671')
    end
  end

  # The OTP is delivered via perform_now — no Que worker, so no retrier and
  # handle_error never runs. A transient provider error must be marked failed (not
  # left 'pending') and re-raised so the caller can react.
  describe 'a synchronous send (perform_now) that fails transiently' do
    let(:user) { create(:user, phone: '+14155552671') }
    let(:delivery) { EmailCampaigns::Sms::Delivery.create!(body: 'hi', status: 'pending', user: user) }
    let(:provider) { instance_double(EmailCampaigns::Sms::Providers::Twilio) }

    before do
      allow(EmailCampaigns::Sms::Providers::Twilio).to receive(:new).and_return(provider)
      allow(provider).to receive(:send)
        .and_raise(EmailCampaigns::Sms::ProviderError::RateLimit.new('slow down'))
    end

    it 'marks the delivery failed and re-raises the provider error' do
      expect { described_class.perform_now(delivery.id) }
        .to raise_error(EmailCampaigns::Sms::ProviderError::RateLimit)

      expect(delivery.reload).to have_attributes(status: 'failed', error_message: 'slow down')
    end
  end

  # que_target is nil for a bare job, so `super` (the retry path) is a no-op here
  # while `expire` is called directly by the job; error_count / maximum_retry_count
  # are stubbed because they also read que_target.
  describe '#handle_error' do
    it 'retries transient provider errors instead of expiring the job' do
      [
        EmailCampaigns::Sms::ProviderError::RateLimit.new('slow down'),
        EmailCampaigns::Sms::ProviderError::ServerError.new('twilio is down'),
        EmailCampaigns::Sms::ProviderError::ServiceUnavailable.new('unavailable')
      ].each do |error|
        job = described_class.new
        allow(job).to receive_messages(error_count: 0, maximum_retry_count: 5)
        expect(job).not_to receive(:expire)

        job.send(:handle_error, error)
      end
    end

    it 'expires the job for every other error, including non-retryable provider errors' do
      [
        EmailCampaigns::Sms::Error.new('our own validation error'),
        EmailCampaigns::Sms::ProviderError.new('permanent provider rejection'),
        ActiveRecord::RecordNotFound.new('delivery is gone'),
        StandardError.new('boom')
      ].each do |error|
        job = described_class.new
        expect(job).to receive(:expire)

        job.send(:handle_error, error)
      end
    end

    it 'marks the delivery failed once Que exhausts its retries so it is not stuck pending' do
      user = create(:user, phone: '+14155552671')
      delivery = EmailCampaigns::Sms::Delivery.create!(body: 'hi', status: 'pending', user: user)
      job = described_class.new(delivery.id)
      allow(job).to receive_messages(error_count: 4, maximum_retry_count: 5)

      job.send(:handle_error, EmailCampaigns::Sms::ProviderError::RateLimit.new('slow down'))

      expect(delivery.reload).to have_attributes(status: 'failed', error_message: 'slow down')
    end

    it 'leaves the delivery pending before retries are exhausted so it can be retried' do
      user = create(:user, phone: '+14155552671')
      delivery = EmailCampaigns::Sms::Delivery.create!(body: 'hi', status: 'pending', user: user)
      job = described_class.new(delivery.id)
      allow(job).to receive_messages(error_count: 0, maximum_retry_count: 5)

      job.send(:handle_error, EmailCampaigns::Sms::ProviderError::RateLimit.new('slow down'))

      expect(delivery.reload.status).to eq('pending')
    end
  end
end
