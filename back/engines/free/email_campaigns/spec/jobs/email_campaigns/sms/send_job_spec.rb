# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::SendJob do
  describe '#run' do
    it "delivers the pending delivery through the send service using the recipient's phone number" do
      user = create(:user, phone: '+14155552671')
      delivery = EmailCampaigns::Sms::Delivery.create!(body: 'hi', status: 'pending', user: user)
      send_service = instance_double(EmailCampaigns::Sms::SendService)
      allow(EmailCampaigns::Sms::SendService).to receive(:new).and_return(send_service)

      expect(send_service).to receive(:deliver).with(delivery, to: '+14155552671')

      described_class.new.run(delivery.id)
    end
  end

  # que_target is nil outside a real Que worker, so `super` (the retry path) is a
  # no-op here while `expire` is called directly by the job. That lets us assert
  # the branch purely by whether `expire` is invoked.
  describe '#handle_error' do
    it 'retries rate-limit errors instead of expiring the job' do
      job = described_class.new
      expect(job).not_to receive(:expire)

      job.send(:handle_error, EmailCampaigns::Sms::Error::RateLimit.new('slow down'))
    end

    it 'expires the job for every other error, including the generic Sms::Error' do
      [
        EmailCampaigns::Sms::Error.new('permanent provider rejection'),
        ActiveRecord::RecordNotFound.new('delivery is gone'),
        StandardError.new('boom')
      ].each do |error|
        job = described_class.new
        expect(job).to receive(:expire)

        job.send(:handle_error, error)
      end
    end
  end
end
