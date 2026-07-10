# frozen_string_literal: true

RSpec.shared_context 'with stubbed SMS provider' do
  include_context 'with sms feature enabled'

  let(:sms_provider) do
    instance_double(
      EmailCampaigns::Sms::Providers::Twilio,
      send: { message_sid: 'SM_test', status: 'queued' },
      fetch_message: { num_segments: 1, price: BigDecimal('-0.0075'), price_unit: 'usd' }
    )
  end

  before { allow(EmailCampaigns::Sms::Providers::Twilio).to receive(:new).and_return(sms_provider) }
end
