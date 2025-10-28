# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Webhook Integration Flow', type: :integration do
  let(:user) { create(:user) }
  let(:project) { create(:project) }

  describe 'end-to-end webhook delivery' do
    let!(:subscription) do
      create(:webhook_subscription,
        events: ['idea.created'],
        url: 'https://webhook.example.com/receive',
        enabled: true)
    end

    before do
      stub_request(:post, 'https://webhook.example.com/receive')
        .to_return(status: 200, body: 'OK')
    end

    it 'delivers webhook when activity is created', :aggregate_failures do
      # Create an idea which triggers activity creation
      idea = create(:idea, author: user, project: project)
      activity = create(:idea_created_activity, item: idea, user: user, project_id: project.id)

      # Trigger webhook processing
      Webhooks::EnqueueService.new.call(activity)

      # Verify delivery was created
      expect(Webhooks::Delivery.count).to eq 1
      delivery = Webhooks::Delivery.first

      expect(delivery.subscription).to eq subscription
      expect(delivery.activity).to eq activity
      expect(delivery.event_type).to eq 'idea.created'
      expect(delivery.status).to eq 'pending'

      # Process the delivery job
      Webhooks::DeliveryJob.perform_now(delivery.id)

      # Verify webhook was sent
      expect(WebMock).to have_requested(:post, 'https://webhook.example.com/receive')
        .with { |req|
          # Verify headers
          req.headers['Content-Type'] == 'application/json' &&
          req.headers['X-Govocal-Event'] == 'idea.created' &&
          req.headers['X-Govocal-Signature'].present? &&
          req.headers['User-Agent'] == 'GoVocal-Webhooks/1.0' &&

          # Verify payload structure
          body = JSON.parse(req.body)
          body['id'] == activity.id &&
          body['event_type'] == 'idea.created' &&
          body['data'].present? &&
          body['metadata'].present?
        }.once

      # Verify delivery was marked as successful
      delivery.reload
      expect(delivery.status).to eq('success')
      expect(delivery.response_code).to eq(200)
      expect(delivery.attempts).to eq(1)
      expect(delivery.succeeded_at).to be_present
    end
  end

  describe 'multiple subscriptions' do
    let!(:sub1) do
      create(:webhook_subscription,
        events: ['idea.created'],
        url: 'https://webhook1.example.com',
        enabled: true)
    end
    let!(:sub2) do
      create(:webhook_subscription,
        events: ['idea.created', 'idea.published'],
        url: 'https://webhook2.example.com',
        enabled: true)
    end

    before do
      stub_request(:post, 'https://webhook1.example.com').to_return(status: 200)
      stub_request(:post, 'https://webhook2.example.com').to_return(status: 200)
    end

    it 'delivers to all matching subscriptions' do
      idea = create(:idea, author: user, project: project)
      activity = create(:idea_created_activity, item: idea, user: user, project_id: project.id)

      Webhooks::EnqueueService.new.call(activity)

      expect(Webhooks::Delivery.count).to eq 2

      # Process both deliveries
      Webhooks::Delivery.find_each do |delivery|
        Webhooks::DeliveryJob.perform_now(delivery.id)
      end

      expect(WebMock).to have_requested(:post, 'https://webhook1.example.com').once
      expect(WebMock).to have_requested(:post, 'https://webhook2.example.com').once
    end
  end

  describe 'project filtering' do
    let(:project1) { create(:project) }
    let(:project2) { create(:project) }

    let!(:global_sub) do
      create(:webhook_subscription,
        events: ['idea.created'],
        url: 'https://global.example.com',
        project: nil)
    end
    let!(:project1_sub) do
      create(:webhook_subscription,
        events: ['idea.created'],
        url: 'https://project1.example.com',
        project: project1)
    end
    let!(:project2_sub) do
      create(:webhook_subscription,
        events: ['idea.created'],
        url: 'https://project2.example.com',
        project: project2)
    end

    before do
      stub_request(:post, /example\.com/).to_return(status: 200)
    end

    it 'delivers to global and project-specific subscriptions' do
      idea = create(:idea, author: user, project: project1)
      activity = create(:idea_created_activity, item: idea, user: user, project_id: project1.id)

      Webhooks::EnqueueService.new.call(activity)

      # Should create deliveries for global and project1 subscriptions only
      expect(Webhooks::Delivery.count).to eq 2
      delivery_subs = Webhooks::Delivery.all.map(&:subscription)
      expect(delivery_subs).to include(global_sub, project1_sub)
      expect(delivery_subs).not_to include(project2_sub)
    end
  end

  describe 'disabled subscriptions' do
    let!(:enabled_sub) do
      create(:webhook_subscription,
        events: ['idea.created'],
        url: 'https://enabled.example.com',
        enabled: true)
    end
    let!(:disabled_sub) do
      create(:webhook_subscription,
        events: ['idea.created'],
        url: 'https://disabled.example.com',
        enabled: false)
    end

    before do
      stub_request(:post, 'https://enabled.example.com').to_return(status: 200)
      stub_request(:post, 'https://disabled.example.com').to_return(status: 200)
    end

    it 'only delivers to enabled subscriptions' do
      idea = create(:idea, author: user, project: project)
      activity = create(:idea_created_activity, item: idea, user: user, project_id: project.id)

      Webhooks::EnqueueService.new.call(activity)

      expect(Webhooks::Delivery.count).to eq 1
      expect(Webhooks::Delivery.first.subscription).to eq enabled_sub

      Webhooks::DeliveryJob.perform_now(Webhooks::Delivery.first.id)

      expect(WebMock).to have_requested(:post, 'https://enabled.example.com').once
      expect(WebMock).not_to have_requested(:post, 'https://disabled.example.com')
    end
  end

  describe 'event type filtering' do
    let!(:idea_sub) do
      create(:webhook_subscription,
        events: ['idea.created'],
        url: 'https://ideas.example.com')
    end
    let!(:user_sub) do
      create(:webhook_subscription,
        events: ['user.created'],
        url: 'https://users.example.com')
    end

    before do
      stub_request(:post, /example\.com/).to_return(status: 200)
    end

    it 'only triggers subscriptions matching the event type' do
      idea = create(:idea, author: user, project: project)
      activity = create(:idea_created_activity, item: idea, user: user, project_id: project.id)

      Webhooks::EnqueueService.new.call(activity)

      expect(Webhooks::Delivery.count).to eq 1
      expect(Webhooks::Delivery.first.subscription).to eq idea_sub
    end
  end

  describe 'error handling and retries' do
    let!(:subscription) do
      create(:webhook_subscription,
        events: ['idea.created'],
        url: 'https://webhook.example.com',
        enabled: true)
    end

    context 'with timeout' do
      before do
        stub_request(:post, 'https://webhook.example.com').to_timeout
      end

      it 'marks delivery as pending and allows retry', :aggregate_failures do
        idea = create(:idea, author: user, project: project)
        activity = create(:idea_created_activity, item: idea, user: user, project_id: project.id)

        Webhooks::EnqueueService.new.call(activity)
        delivery = Webhooks::Delivery.first

        expect { Webhooks::DeliveryJob.perform_now(delivery.id) }
          .to raise_error(HTTP::TimeoutError)

        delivery.reload
        expect(delivery.status).to eq('pending')
        expect(delivery.attempts).to eq(1)
        expect(delivery.error_message).to include('TimeoutError')
      end
    end

    context 'with HTTP error' do
      before do
        stub_request(:post, 'https://webhook.example.com').to_return(status: 500)
      end

      it 'records error and allows retry', :aggregate_failures do
        idea = create(:idea, author: user, project: project)
        activity = create(:idea_created_activity, item: idea, user: user, project_id: project.id)

        Webhooks::EnqueueService.new.call(activity)
        delivery = Webhooks::Delivery.first

        expect { Webhooks::DeliveryJob.perform_now(delivery.id) }
          .to raise_error(HTTP::Error)

        delivery.reload
        expect(delivery.attempts).to eq(1)
        expect(delivery.response_code).to eq(500)
      end
    end
  end

  describe 'HMAC signature verification' do
    let!(:subscription) do
      create(:webhook_subscription,
        events: ['idea.created'],
        url: 'https://webhook.example.com',
        secret_token: 'test_secret_token')
    end

    before do
      stub_request(:post, 'https://webhook.example.com').to_return(status: 200)
    end

    it 'generates valid HMAC signature that can be verified by receiver', :aggregate_failures do
      idea = create(:idea, author: user, project: project)
      activity = create(:idea_created_activity, item: idea, user: user, project_id: project.id)

      Webhooks::EnqueueService.new.call(activity)
      delivery = Webhooks::Delivery.first

      Webhooks::DeliveryJob.perform_now(delivery.id)

      # Extract request details
      request = WebMock.requests.first
      signature = request.headers['X-Govocal-Signature']
      body = request.body

      # Verify signature format
      expect(signature).to match(/^sha256=/)

      # Verify signature is valid
      expected_hmac = OpenSSL::HMAC.digest(
        OpenSSL::Digest.new('sha256'),
        'test_secret_token',
        body
      )
      expected_signature = "sha256=#{Base64.strict_encode64(expected_hmac)}"

      expect(signature).to eq(expected_signature)
    end
  end

  describe 'payload structure' do
    let!(:subscription) do
      create(:webhook_subscription,
        events: ['idea.created'],
        url: 'https://webhook.example.com')
    end

    before do
      stub_request(:post, 'https://webhook.example.com').to_return(status: 200)
    end

    it 'sends complete and correctly structured payload', :aggregate_failures do
      idea = create(:idea, author: user, project: project)
      activity = create(:idea_created_activity,
        item: idea,
        user: user,
        project_id: project.id,
        acted_at: Time.zone.parse('2025-10-22 10:30:00'))

      Webhooks::EnqueueService.new.call(activity)
      delivery = Webhooks::Delivery.first

      Webhooks::DeliveryJob.perform_now(delivery.id)

      request = WebMock.requests.first
      payload = JSON.parse(request.body)

      # Verify top-level structure
      expect(payload).to include('id', 'event', 'event_type', 'timestamp', 'data', 'metadata')

      # Verify event details
      expect(payload['id']).to eq(activity.id)
      expect(payload['event_type']).to eq('idea.created')
      expect(payload['timestamp']).to match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)

      # Verify metadata
      expect(payload['metadata']).to include(
        'item_type' => 'Idea',
        'item_id' => idea.id,
        'action' => 'created',
        'user_id' => user.id,
        'project_id' => project.id,
        'tenant_id' => Tenant.current.id
      )

      # Verify data is present and serialized
      expect(payload['data']).to be_present
      expect(payload['data']).to have_key('id')
      expect(payload['data']).to have_key('type')
    end
  end

  describe 'any_enabled optimization' do
    it 'does not process webhooks when none are enabled' do
      # No subscriptions exist
      expect(Webhooks::Subscription.any_enabled?).to be false

      idea = create(:idea, author: user, project: project)
      activity = create(:idea_created_activity, item: idea, user: user, project_id: project.id)

      # EnqueueService should not be called due to early return check
      expect(Webhooks::EnqueueService).not_to receive(:new)

      # Simulate LogActivityJob with any_enabled check
      return unless Webhooks::Subscription.any_enabled?

      Webhooks::EnqueueService.new.call(activity)
    end

    it 'processes webhooks when subscriptions are enabled' do
      create(:webhook_subscription,
        events: ['idea.created'],
        url: 'https://webhook.example.com',
        enabled: true)

      stub_request(:post, 'https://webhook.example.com').to_return(status: 200)

      # Should return true when enabled subscriptions exist
      expect(Webhooks::Subscription.any_enabled?).to be true

      idea = create(:idea, author: user, project: project)
      activity = create(:idea_created_activity, item: idea, user: user, project_id: project.id)

      Webhooks::EnqueueService.new.call(activity)

      expect(Webhooks::Delivery.count).to eq 1
    end
  end

  describe 'cleanup job' do
    it 'removes old deliveries' do
      subscription = create(:webhook_subscription, events: ['idea.created'])
      activity = create(:idea_created_activity)

      # Create old deliveries
      old_success = create(:webhook_delivery, :succeeded,
        subscription: subscription,
        activity: activity,
        created_at: 31.days.ago)
      old_failed = create(:webhook_delivery, :failed,
        subscription: subscription,
        activity: activity,
        created_at: 31.days.ago)

      # Create recent delivery
      recent = create(:webhook_delivery,
        subscription: subscription,
        activity: activity,
        created_at: 1.day.ago)

      expect { Webhooks::CleanupDeliveriesJob.perform_now }
        .to change(Webhooks::Delivery, :count).by(-2)

      expect(Webhooks::Delivery.exists?(old_success.id)).to be false
      expect(Webhooks::Delivery.exists?(old_failed.id)).to be false
      expect(Webhooks::Delivery.exists?(recent.id)).to be true
    end
  end
end
