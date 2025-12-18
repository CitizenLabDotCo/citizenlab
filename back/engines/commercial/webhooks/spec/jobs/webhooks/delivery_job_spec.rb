# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::DeliveryJob do
  let(:subscription) { create(:webhook_subscription, url: 'https://webhook.example.com/receive') }
  let(:activity) { create(:idea_created_activity) }
  let(:delivery) { create(:webhook_delivery, subscription: subscription, activity: activity) }

  before do
    allow(Resolv).to receive(:getaddresses).with(a_string_matching(/webhook.example.com.*/)).and_return(['93.184.216.34'])

    stub_request(:post, 'https://webhook.example.com/receive').to_return(status: 200, body: 'OK')
  end

  describe '#perform' do
    it 'delivers webhook successfully' do
      described_class.perform_now(delivery)

      expect(delivery.reload.status).to eq('success')
      expect(delivery.response_code).to eq(200)
      expect(delivery.attempts).to eq(1)
      expect(delivery.succeeded_at).to be_present
    end

    it 'makes HTTP POST request to subscription URL' do
      described_class.perform_now(delivery)

      expect(WebMock).to have_requested(:post, 'https://webhook.example.com/receive').once
    end

    it 'includes correct HTTP headers' do
      described_class.perform_now(delivery)

      expect(WebMock).to have_requested(:post, 'https://webhook.example.com/receive')
        .with(headers: {
          'Content-Type' => 'application/json',
          'X-Govocal-Event' => 'idea.created',
          'X-Govocal-Signature' => /^sha256=.+/,
          'X-Govocal-Delivery-Id' => delivery.id,
          'User-Agent' => 'GoVocal-Webhooks/1.0'
        })
    end

    it 'sends correct JSON payload' do
      described_class.perform_now(delivery)

      expect(WebMock).to(have_requested(:post, 'https://webhook.example.com/receive')
        .with do |req|
          body = JSON.parse(req.body)
          body['id'] == activity.id &&
            body['event_type'] == 'idea.created' &&
            body['item'].present?
        end)
    end

    it 'generates valid HMAC signature' do
      described_class.perform_now(delivery)
      expect(
        a_request(:post, 'https://webhook.example.com/receive')
        .with do |request|
          signature = request.headers['X-Govocal-Signature']
          expected_hmac = OpenSSL::HMAC.digest(
            OpenSSL::Digest.new('sha256'),
            subscription.secret_token,
            request.body
          )
          expected_signature = "sha256=#{Base64.strict_encode64(expected_hmac)}"

          expect(signature).to eq(expected_signature)

          true
        end
      ).to have_been_made.once
    end

    it 'records response body' do
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_return(status: 200, body: 'Success response')

      described_class.perform_now(delivery)

      expect(delivery.reload.response_body).to eq('Success response')
    end

    it 'truncates large response bodies' do
      large_body = 'x' * 50_000

      stub_request(:post, 'https://webhook.example.com/receive')
        .to_return(status: 200, body: large_body)

      described_class.perform_now(delivery)

      expect(delivery.reload.response_body.length).to eq(10_000)
    end

    it 'skips delivery if subscription is disabled' do
      subscription.update!(enabled: false)

      described_class.perform_now(delivery)

      expect(WebMock).not_to have_requested(:post, 'https://webhook.example.com/receive')
    end
  end

  describe 'SSRF protection' do
    it 'validates URL at delivery time (DNS rebinding protection)' do
      # URL was valid at subscription creation, but now resolves to private IP
      allow_any_instance_of(described_class)
        .to receive(:validate_url_safe)
        .and_return(false)

      described_class.perform_now(delivery)

      expect(delivery.reload.status).to eq('failed')
      expect(delivery.error_message).to include('Security error')
    end

    it 'does not retry security errors' do
      allow_any_instance_of(described_class)
        .to receive(:validate_url_safe)
        .and_return(false)

      # Should not raise error (which would trigger retry)
      expect { described_class.perform_now(delivery) }
        .not_to raise_error

      expect(delivery.reload.status).to eq('failed')
    end

    it 'does not follow HTTP redirects' do
      stub = stub_request(:post, 'https://webhook.example.com/receive')
        .to_return(status: 302, headers: { 'Location' => 'https://malicious.example.com' })

      described_class.perform_now(delivery)
      expect(stub).to have_been_requested
      expect(a_request(:any, 'https://malicious.example.com')).not_to have_been_made
    end
  end

  describe 'error handling' do
    it 'handles timeout errors' do
      stub_request(:post, 'https://webhook.example.com/receive').to_timeout

      # When calling perform_now, any errors raised in `perform` are _returned_
      # as opposed to being thrown
      expect(described_class.perform_now(delivery)).to be_a(HTTP::TimeoutError)

      expect(delivery.reload.status).to eq('pending') # Will retry
      expect(delivery.attempts).to eq(1)
      expect(delivery.error_message).to include('TimeoutError')
    end

    it 'handles connection errors' do
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_raise(HTTP::ConnectionError.new('Connection refused'))

      expect(described_class.perform_now(delivery)).to be_a(HTTP::ConnectionError)

      expect(delivery.reload.attempts).to eq(1)
      expect(delivery.error_message).to include('Connection refused')
    end

    it 'handles HTTP errors' do
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_return(status: 500, body: 'Internal Server Error')

      expect(described_class.perform_now(delivery)).to be_a(Webhooks::DeliveryJob::UnsuccessfulResponse)

      expect(delivery.reload.attempts).to eq(1)
    end

    it 'records last_attempt_at' do
      freeze_time do
        stub_request(:post, 'https://webhook.example.com/receive').to_timeout

        begin
          described_class.perform_now(delivery)
        rescue HTTP::TimeoutError
          # Expected
        end

        expect(delivery.reload.last_attempt_at).to be_within(1.second).of(Time.current)
      end
    end
  end

  describe 'different HTTP response codes' do
    it 'treats 2xx as success' do
      [200, 201, 202, 204].each do |code|
        stub_request(:post, 'https://webhook.example.com/receive')
          .to_return(status: code)

        delivery = create(:webhook_delivery, subscription: subscription, activity: activity)

        described_class.perform_now(delivery)

        expect(delivery.reload.status).to eq('success')
      end
    end

    it 'treats 4xx as failure' do
      [400, 401, 404, 422].each do |code|
        stub_request(:post, 'https://webhook.example.com/receive')
          .to_return(status: code)

        delivery = create(:webhook_delivery, subscription: subscription, activity: activity)

        expect(described_class.perform_now(delivery)).to be_a(Webhooks::DeliveryJob::UnsuccessfulResponse)
      end
    end

    it 'treats 5xx as failure' do
      [500, 502, 503].each do |code|
        stub_request(:post, 'https://webhook.example.com/receive')
          .to_return(status: code)

        delivery = create(:webhook_delivery, subscription: subscription, activity: activity)

        expect(described_class.perform_now(delivery)).to be_a(Webhooks::DeliveryJob::UnsuccessfulResponse)
      end
    end
  end
end
