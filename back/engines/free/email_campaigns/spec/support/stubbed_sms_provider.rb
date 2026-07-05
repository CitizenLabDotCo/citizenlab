# frozen_string_literal: true

# Shared setup for specs that trigger a *synchronous* SMS send (e.g. the phone
# confirmation OTP, sent in-process during the request). Such a send reaches the
# real provider, so it must be stubbed to avoid a network call.
#
# Centralises the one place a spec has to name the concrete SMS vendor: include
# this context and reference `sms_provider` instead of stubbing Twilio inline.
RSpec.shared_context 'with stubbed SMS provider' do
  let(:sms_provider) do
    instance_double(EmailCampaigns::Sms::Providers::Twilio, send: { message_sid: 'SM_test', status: 'queued' })
  end

  before { allow(EmailCampaigns::Sms::Providers::Twilio).to receive(:new).and_return(sms_provider) }
end
