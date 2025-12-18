# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Webhook Deliveries' do
  explanation 'Webhook deliveries represent individual attempts to send webhook notifications.'

  before do
    allow(Resolv).to receive(:getaddresses).with(a_string_matching(/webhook.example.com.*/)).and_return(['93.184.216.34'])

    header 'Content-Type', 'application/json'
    admin_header_token
  end

  let(:subscription) { create(:webhook_subscription) }
  let(:webhook_subscription_id) { subscription.id }

  get 'web_api/v1/webhook_subscriptions/:webhook_subscription_id/webhook_deliveries' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of deliveries per page'
    end

    context 'as an admin' do
      before do
        @activity = create(:idea_created_activity)
        @deliveries = create_list(:webhook_delivery, 5,
          subscription: subscription,
          activity: @activity)
      end

      example_request 'List all deliveries for a subscription' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
      end

      example 'List is ordered by most recent first' do
        create(:webhook_delivery,
          subscription: subscription,
          activity: @activity,
          created_at: 2.days.ago)
        newest_delivery = create(:webhook_delivery,
          subscription: subscription,
          activity: @activity,
          created_at: 1.day.from_now)

        do_request

        json_response = json_parse(response_body)
        ids = json_response[:data].map { |d| d[:id] }
        expect(ids.first).to eq newest_delivery.id
        expect(ids.last).not_to eq newest_delivery.id
      end

      example 'Pagination works correctly' do
        do_request(page: { number: 1, size: 2 })

        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end
    end

    context 'as a regular user' do
      before do
        @user = create(:user)
        header_token_for(@user)
        create(:webhook_delivery, subscription: subscription, activity: create(:idea_created_activity))
      end

      example_request 'Returns 401 unauthorized' do
        expect(status).to eq 401
      end
    end
  end

  get 'web_api/v1/webhook_deliveries/:id' do
    let(:activity) { create(:idea_created_activity) }
    let(:delivery) do
      create(:webhook_delivery, :succeeded,
        subscription: subscription,
        activity: activity,
        response_code: 200,
        response_body: 'Success')
    end
    let(:id) { delivery.id }

    example_request 'Get one webhook delivery' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq delivery.id
      expect(json_response.dig(:data, :attributes, :status)).to eq 'success'
      expect(json_response.dig(:data, :attributes, :response_code)).to eq 200
      expect(json_response.dig(:data, :attributes, :response_body)).to eq 'Success'
    end

    example 'Shows all delivery details' do
      do_request

      json_response = json_parse(response_body)
      attributes = json_response.dig(:data, :attributes)

      expect(attributes[:event_type]).to be_present
      expect(attributes[:attempts]).to be_present
      expect(attributes[:created_at]).to be_present
      expect(attributes[:succeeded_at]).to be_present
    end

    context 'with failed delivery' do
      let(:delivery) do
        create(:webhook_delivery, :failed,
          subscription: subscription,
          activity: activity,
          error_message: 'Connection timeout')
      end

      example 'Shows error information' do
        do_request

        json_response = json_parse(response_body)
        attributes = json_response.dig(:data, :attributes)

        expect(attributes[:status]).to eq 'failed'
        expect(attributes[:error_message]).to eq 'Connection timeout'
      end
    end
  end

  context 'filtering deliveries' do
    get 'web_api/v1/webhook_subscriptions/:webhook_subscription_id/webhook_deliveries' do
      let(:activity) { create(:idea_created_activity) }

      before do
        create(:webhook_delivery, :succeeded,
          subscription: subscription,
          activity: activity)
        create(:webhook_delivery, :failed,
          subscription: subscription,
          activity: activity)
        create(:webhook_delivery,
          subscription: subscription,
          activity: activity,
          status: 'pending')
      end

      example 'Shows all statuses by default' do
        do_request

        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
      end
    end
  end

  context 'cross-subscription isolation' do
    get 'web_api/v1/webhook_subscriptions/:webhook_subscription_id/webhook_deliveries' do
      let(:other_subscription) { create(:webhook_subscription) }
      let(:activity) { create(:idea_created_activity) }

      before do
        # Create deliveries for our subscription
        create_list(:webhook_delivery, 2,
          subscription: subscription,
          activity: activity)

        # Create deliveries for another subscription
        create_list(:webhook_delivery, 3,
          subscription: other_subscription,
          activity: activity)
      end

      example 'Only returns deliveries for the specified subscription' do
        do_request

        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2

        # Verify all deliveries belong to our subscription
        json_response[:data].each do |delivery_data|
          delivery = Webhooks::Delivery.find(delivery_data[:id])
          expect(delivery.webhooks_subscription_id).to eq subscription.id
        end
      end
    end
  end

  post 'web_api/v1/webhook_deliveries/:id/replay' do
    let(:activity) { create(:idea_created_activity) }
    let(:delivery) do
      create(:webhook_delivery, :succeeded,
        subscription: subscription,
        activity: activity)
    end
    let(:id) { delivery.id }

    example_request 'Replay a webhook delivery' do
      expect(status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :status)).to eq 'pending'

      new_delivery = Webhooks::Delivery.find(json_response.dig(:data, :id))
      expect(new_delivery.subscription).to eq delivery.subscription
      expect(new_delivery.activity).to eq delivery.activity
      expect(new_delivery.event_type).to eq delivery.event_type
      expect(new_delivery.status).to eq 'pending'
    end
  end
end
