# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'SMS Callbacks' do
  explanation 'Endpoint that receives delivery-status callbacks from the SMS provider (Twilio)'

  # Use the real Twilio provider so #parse_callback runs for real, but bypass the
  # HMAC signature check, which needs a genuinely Twilio-signed request.
  let(:signature_valid) { true }
  let(:provider) do
    EmailCampaigns::Sms::Providers::Twilio.new.tap do |twilio|
      allow(twilio).to receive(:verify_signature).and_return(signature_valid)
    end
  end

  before do
    allow(EmailCampaigns::Sms::Providers::Twilio).to receive(:new).and_return(provider)
    header 'Content-Type', 'application/json'
  end

  post 'web_api/v1/sms/callbacks' do
    let!(:delivery) do
      EmailCampaigns::Sms::Delivery.create!(body: 'hi', status: 'sent', message_sid: 'SM_123')
    end
    let(:message_sid) { 'SM_123' }
    let(:message_status) { 'delivered' }
    let(:callback_params) { { MessageSid: message_sid, MessageStatus: message_status } }

    example 'advances the matching delivery and returns 200' do
      do_request(callback_params)
      expect(response_status).to eq 200
      expect(delivery.reload.status).to eq 'delivered'
    end

    # The provider needs a moment to populate the segment count and price, so the read is
    # deferred rather than fired the instant the callback lands.
    example 'reads back what the message cost once it reaches a terminal status' do
      freeze_time do
        expect { do_request(callback_params) }
          .to have_enqueued_job(EmailCampaigns::Sms::FetchMessageJob)
          .with(delivery.id)
          .at(EmailCampaigns::Sms::FetchMessageJob::SETTLE_DELAY.from_now)
      end
    end

    context 'when the delivery is not yet terminal' do
      let(:message_status) { 'sent' }
      let!(:delivery) do
        EmailCampaigns::Sms::Delivery.create!(body: 'hi', status: 'queued', message_sid: 'SM_123')
      end

      example 'does not read the message back yet, since the price is not settled' do
        expect { do_request(callback_params) }
          .not_to have_enqueued_job(EmailCampaigns::Sms::FetchMessageJob)
      end
    end

    context 'when a duplicate terminal callback arrives' do
      before { delivery.advance_status!('delivered') }

      example 'does not enqueue a second fetch' do
        expect { do_request(callback_params) }
          .not_to have_enqueued_job(EmailCampaigns::Sms::FetchMessageJob)
      end
    end

    context 'when the signature is invalid' do
      let(:signature_valid) { false }

      example 'returns 403 and leaves the delivery untouched' do
        do_request(callback_params)
        expect(response_status).to eq 403
        expect(delivery.reload.status).to eq 'sent'
      end
    end

    context 'when the callback carries no message SID' do
      let(:message_sid) { '' }
      # A still-pending delivery whose message_sid is NULL — the row a nil-SID
      # find_by would otherwise wrongly latch onto and mutate.
      let!(:pending_delivery) { EmailCampaigns::Sms::Delivery.create!(body: 'hey', status: 'pending') }

      example 'returns 400 and mutates no delivery' do
        do_request(callback_params)
        expect(response_status).to eq 400
        expect(pending_delivery.reload.status).to eq 'pending'
        expect(delivery.reload.status).to eq 'sent'
      end
    end

    context 'when the message SID matches no delivery' do
      let(:message_sid) { 'SM_unknown' }

      example 'returns 404' do
        do_request(callback_params)
        expect(response_status).to eq 404
      end
    end

    context 'when the provider status is legitimate but unmapped (e.g. canceled)' do
      let(:message_status) { 'canceled' }

      example 'reports the raw status and acknowledges with 200, without changing the delivery' do
        expect(ErrorReporter).to receive(:report_msg)
          .with(anything, extra: hash_including(delivery_id: delivery.id, raw_status: 'canceled'))

        do_request(callback_params)
        expect(response_status).to eq 200
        expect(delivery.reload.status).to eq 'sent'
      end
    end
  end
end
