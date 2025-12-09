# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Webhook Subscriptions' do
  explanation 'Webhooks allow external systems to receive real-time notifications about events in the platform.'

  before do
    allow(Resolv).to receive(:getaddresses).with(a_string_matching(/webhook.example.com.*/)).and_return(['93.184.216.34'])

    header 'Content-Type', 'application/json'
    admin_header_token
  end

  get 'web_api/v1/webhook_subscriptions' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of subscriptions per page'
    end

    context 'as an admin' do
      before do
        @subscriptions = create_list(:webhook_subscription, 3)
      end

      example_request 'List all webhook subscriptions' do
        expect(status).to eq 200
        expect(response_data.size).to eq 3
      end

      example 'List includes project relationship' do
        subscription = create(:webhook_subscription, :with_project)

        do_request

        expect(status).to eq 200
        json_response = json_parse(response_body)
        subscription_data = json_response[:data].find { |s| s[:id] == subscription.id }
        expect(subscription_data.dig(:relationships, :project)).to be_present
      end
    end

    context 'as a regular user' do
      before do
        @user = create(:user)
        header_token_for(@user)
        create(:webhook_subscription)
      end

      example_request 'Returns 401 unauthorized' do
        expect(status).to eq 401
      end
    end
  end

  get 'web_api/v1/webhook_subscriptions/:id' do
    let(:subscription) { create(:webhook_subscription, name: 'Test Webhook') }
    let(:id) { subscription.id }

    example_request 'Get one webhook subscription' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq subscription.id
      expect(json_response.dig(:data, :attributes, :name)).to eq 'Test Webhook'
    end

    example 'Secret token is masked' do
      do_request
      expect(response_data[:attributes]).not_to have_key(:secret_token)
      masked_secret = response_data[:attributes][:masked_secret_token]
      expect(masked_secret).to include '...'
      expect(masked_secret).not_to eq subscription.secret_token
    end
  end

  post 'web_api/v1/webhook_subscriptions' do
    with_options scope: :webhook_subscription do
      parameter :name, 'Name of the webhook subscription', required: true
      parameter :url, 'The URL to POST webhook payloads to', required: true
      parameter :events, 'Array of event types to subscribe to', required: true
      parameter :enabled, 'Whether the webhook is enabled', required: false
      parameter :project_id, 'Optional project ID to scope events', required: false
    end

    let(:name) { 'My Webhook' }
    let(:url) { 'https://webhook.example.com/receive' }
    let(:events) { ['idea.created', 'idea.published'] }
    let(:enabled) { true }

    before do
      # Stub DNS resolution for URL validation
      allow(Resolv).to receive(:getaddresses).and_return(['93.184.216.34'])
    end

    example_request 'Create a webhook subscription' do
      expect(status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :name)).to eq 'My Webhook'
      expect(json_response.dig(:data, :attributes, :url)).to eq url
      expect(json_response.dig(:data, :attributes, :secret_token)).to be_present
      expect(json_response.dig(:data, :attributes, :masked_secret_token)).to be_present
      expect(json_response.dig(:data, :attributes, :events)).to match_array events
    end

    context 'with project scoping' do
      let(:project) { create(:project) }
      let(:project_id) { project.id }

      example 'Creates subscription scoped to project' do
        do_request

        expect(status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
      end
    end

    context 'with invalid URL' do
      let(:url) { 'not-a-url' }

      example 'Returns validation errors' do
        do_request

        expect(status).to eq 422
        json_response = json_parse(response_body)
        expect(json_response[:errors]).to be_present
      end
    end

    context 'with private IP address' do
      let(:url) { 'https://10.0.0.1' }

      before do
        allow(Resolv).to receive(:getaddresses).and_return(['10.0.0.1'])
      end

      example 'Rejects private IP addresses' do
        do_request

        expect(status).to eq 422
      end
    end

    context 'with unsupported events' do
      let(:events) { ['unsupported.event'] }

      example 'Returns validation errors' do
        do_request

        expect(status).to eq 422
      end
    end
  end

  patch 'web_api/v1/webhook_subscriptions/:id' do
    let(:subscription) { create(:webhook_subscription) }
    let(:id) { subscription.id }

    with_options scope: :webhook_subscription do
      parameter :name, 'Name of the webhook subscription'
      parameter :url, 'The URL to POST webhook payloads to'
      parameter :events, 'Array of event types to subscribe to'
      parameter :enabled, 'Whether the webhook is enabled'
    end

    let(:name) { 'Updated Name' }

    before do
      allow(Resolv).to receive(:getaddresses).and_return(['93.184.216.34'])
    end

    example_request 'Update a webhook subscription' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :name)).to eq 'Updated Name'
    end

    context 'disabling subscription' do
      let(:enabled) { false }

      example 'Disables the subscription' do
        do_request

        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :enabled)).to be false
      end
    end
  end

  delete 'web_api/v1/webhook_subscriptions/:id' do
    let!(:subscription) { create(:webhook_subscription) }
    let(:id) { subscription.id }

    example_request 'Delete a webhook subscription' do
      expect(status).to eq 204
      expect(Webhooks::Subscription.exists?(subscription.id)).to be false
    end

    example 'Also deletes associated deliveries' do
      create(:webhook_delivery, subscription: subscription)

      expect { do_request }
        .to change(Webhooks::Delivery, :count).by(-1)
    end
  end

  post 'web_api/v1/webhook_subscriptions/:id/regenerate_secret' do
    let(:subscription) { create(:webhook_subscription) }
    let(:id) { subscription.id }
    let!(:old_secret) { subscription.secret_token }

    example_request 'Regenerate secret token' do
      expect(status).to eq 200

      # Verify secret was changed
      subscription.reload
      expect(subscription.secret_token).not_to eq old_secret
    end
  end
end
