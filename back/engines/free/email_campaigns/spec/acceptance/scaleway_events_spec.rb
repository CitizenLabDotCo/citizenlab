# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Scaleway TEM events' do
  explanation 'Endpoint that receives Scaleway Transactional Email webhook events, pushed through Topics and Events (SNS)'
  header 'Content-Type', 'application/json'

  post 'hooks/scaleway_events' do
    let(:delivery) { create(:delivery) }
    let(:tenant_id) { AppConfiguration.instance.id }
    let(:delivery_id) { delivery.id }
    let(:event_type) { 'email_delivered' }
    let(:event) do
      {
        'id' => SecureRandom.uuid,
        'type' => event_type,
        'email_id' => SecureRandom.uuid,
        'email_from' => 'participation@mail.brussels.be',
        'email_to' => delivery.user.email,
        'email_headers' => [
          { 'key' => 'X-Govocal-Tenant-Id', 'value' => tenant_id },
          { 'key' => 'X-Govocal-Delivery-Id', 'value' => delivery_id }
        ],
        'email_response_code' => 250,
        'email_response_message' => '2.0.0 OK'
      }
    end
    let(:envelope) { { 'Type' => 'Notification', 'Message' => event.to_json } }

    # The envelope's validity (signature, topic) has its own spec; here `parse!`
    # hands back the message with an unverified envelope.
    before do
      allow(EmailCampaigns::ScalewaySnsMessage).to receive(:parse!) do |raw_body|
        EmailCampaigns::ScalewaySnsMessage.send(:new, JSON.parse(raw_body))
      end
    end

    example 'Receive a delivered event' do
      do_request(envelope)

      expect(response_status).to eq(200)
      expect(delivery.reload.delivery_status).to eq('delivered')
    end

    example 'Switches tenant correctly', document: false do
      envelope # create all data needed for this test
      tenant = Tenant.current
      Apartment::Tenant.reset

      do_request(envelope)

      expect(response_status).to eq(200)
      tenant.switch!
      expect(delivery.reload.delivery_status).to eq('delivered')
    end

    describe 'status mapping', document: false do
      using RSpec::Parameterized::TableSyntax

      where(:event_type, :status) do
        'email_queued'  | 'accepted'
        'email_dropped' | 'bounced'
        'email_spam'    | 'failed'
      end

      with_them do
        example "sets the delivery status (#{params[:status]})" do
          do_request(envelope)
          expect(delivery.reload.delivery_status).to eq(status)
        end
      end

      example 'does not move a delivery backwards when events arrive out of order' do
        do_request(envelope) # delivered
        do_request(envelope.merge('Message' => event.merge('type' => 'email_queued').to_json))

        expect(delivery.reload.delivery_status).to eq('delivered')
      end

      context 'for an event type with no status' do
        let(:event_type) { 'email_deferred' }

        example 'acknowledges without changing the delivery' do
          do_request(envelope)

          expect(response_status).to eq(200)
          expect(delivery.reload.delivery_status).to eq('sent')
        end
      end
    end

    describe 'bounces', document: false do
      context 'when the mailbox is not found' do
        let(:event_type) { 'email_mailbox_not_found' }
        let(:event) do
          super().merge(
            'email_response_code' => 550,
            'email_response_message' => '5.1.1 The email account does not exist'
          )
        end

        example 'marks the delivery as bounced and the user as bounced' do
          do_request(envelope)

          expect(delivery.reload.delivery_status).to eq('bounced')
          expect(delivery.user.reload).to have_attributes(
            email_bounced_at: be_present,
            email_bounce_reason: '550 5.1.1 The email account does not exist'
          )
        end
      end

      context 'when the email is dropped for another reason' do
        let(:event_type) { 'email_dropped' }

        example 'marks the delivery as bounced but leaves the user alone' do
          do_request(envelope)

          expect(delivery.reload.delivery_status).to eq('bounced')
          expect(delivery.user.reload.email_bounced_at).to be_nil
        end
      end
    end

    describe 'events we cannot match', document: false do
      context 'for an unknown delivery' do
        let(:delivery_id) { SecureRandom.uuid }

        example 'acknowledges with 200' do
          do_request(envelope)
          expect(response_status).to eq(200)
        end
      end

      context 'for an unknown tenant' do
        let(:tenant_id) { SecureRandom.uuid }

        example 'acknowledges with 200 without touching the delivery' do
          do_request(envelope)

          expect(response_status).to eq(200)
          expect(delivery.reload.delivery_status).to eq('sent')
        end
      end
    end

    example 'Confirm a subscription', document: false do
      subscribe_url = 'https://sns.mnq.fr-par.scaleway.com/?Action=ConfirmSubscription&TopicArn=x&Token=y'
      confirmation = stub_request(:get, subscribe_url).to_return(status: 200)

      do_request('Type' => 'SubscriptionConfirmation', 'SubscribeURL' => subscribe_url)

      expect(response_status).to eq(200)
      expect(confirmation).to have_been_made
    end

    example '[error] Refuse an invalid envelope', document: false do
      allow(EmailCampaigns::ScalewaySnsMessage).to receive(:parse!).and_call_original

      do_request(envelope)

      expect(response_status).to eq(401)
      expect(delivery.reload.delivery_status).to eq('sent')
    end
  end
end
