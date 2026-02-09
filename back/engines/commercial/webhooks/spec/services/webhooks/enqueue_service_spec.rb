# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::EnqueueService do
  let(:user) { create(:user) }
  let(:project) { create(:project) }
  let(:idea) { create(:idea, author: user, project: project) }

  before do
    allow(Resolv).to receive(:getaddresses).with(a_string_matching(/webhook.example.com.*/)).and_return(['93.184.216.34'])
    ActiveJob::Base.queue_adapter.enqueued_jobs.clear
  end

  describe '#call' do
    context 'with matching subscriptions' do
      let!(:subscription) do
        create(:webhook_subscription, events: ['idea.created'], enabled: true)
      end
      let(:activity) { create(:idea_created_activity, item: idea, user: user) }

      it 'creates a delivery record' do
        expect { described_class.new.call(activity) }
          .to change(Webhooks::Delivery, :count).by(1)
      end

      it 'enqueues a delivery job' do
        expect { described_class.new.call(activity) }
          .to have_enqueued_job(Webhooks::DeliveryJob)
      end

      it 'creates delivery with correct attributes' do
        described_class.new.call(activity)

        delivery = Webhooks::Delivery.last
        expect(delivery.subscription).to eq(subscription)
        expect(delivery.activity).to eq(activity)
        expect(delivery.event_type).to eq('idea.created')
        expect(delivery.status).to eq('pending')
      end

      it 'enqueues job with the delivery' do
        described_class.new.call(activity)

        delivery = Webhooks::Delivery.last
        expect(Webhooks::DeliveryJob).to have_been_enqueued.with(delivery)
      end
    end

    context 'with multiple matching subscriptions' do
      let!(:sub1) { create(:webhook_subscription, events: ['idea.created']) }
      let!(:sub2) { create(:webhook_subscription, events: ['idea.created', 'idea.published']) }
      let(:activity) { create(:idea_created_activity, item: idea, user: user) }

      it 'enqueues jobs for each subscription' do
        described_class.new.call(activity)

        expect(Webhooks::DeliveryJob).to have_been_enqueued.exactly(2).times
      end

      it 'creates deliveries for all matching subscriptions' do
        expect { described_class.new.call(activity) }
          .to change(Webhooks::Delivery, :count).by(2)
      end
    end

    context 'with project filtering' do
      let(:other_project) { create(:project) }
      let!(:project_sub) { create(:webhook_subscription, events: ['idea.created'], project: project) }
      let!(:other_project_sub) { create(:webhook_subscription, events: ['idea.created'], project: other_project) }
      let!(:global_sub) { create(:webhook_subscription, events: ['idea.created'], project: nil) }

      it 'delivers to subscription matching project' do
        activity = create(:idea_created_activity, item: idea, project_id: project.id)

        described_class.new.call(activity)

        deliveries = Webhooks::Delivery.all
        expect(deliveries.map(&:subscription)).to include(project_sub, global_sub)
        expect(deliveries.map(&:subscription)).not_to include(other_project_sub)
      end

      it 'delivers to global subscriptions for any project' do
        activity = create(:idea_created_activity, item: idea)

        described_class.new.call(activity)

        expect(Webhooks::Delivery.where(subscription: global_sub).count).to eq(1)
      end
    end

    context 'with disabled subscriptions' do
      let!(:enabled_sub) { create(:webhook_subscription, events: ['idea.created'], enabled: true) }
      let!(:disabled_sub) { create(:webhook_subscription, events: ['idea.created'], enabled: false) }
      let(:activity) { create(:idea_created_activity, item: idea, user: user) }

      it 'only creates deliveries for enabled subscriptions' do
        described_class.new.call(activity)

        expect(Webhooks::Delivery.where(subscription: enabled_sub).count).to eq(1)
        expect(Webhooks::Delivery.where(subscription: disabled_sub).count).to eq(0)
      end
    end

    context 'with non-matching events' do
      let!(:subscription) { create(:webhook_subscription, events: ['user.created']) }
      let(:activity) { create(:idea_created_activity, item: idea, user: user) }

      it 'does not create deliveries' do
        expect { described_class.new.call(activity) }
          .not_to change(Webhooks::Delivery, :count)
      end

      it 'does not enqueue jobs' do
        expect { described_class.new.call(activity) }
          .not_to have_enqueued_job(Webhooks::DeliveryJob)
      end
    end

    context 'with unsupported event types' do
      let!(:subscription) { create(:webhook_subscription, events: ['idea.created']) }
      let(:activity) do
        create(:activity,
          item_type: 'Comment',
          item_id: SecureRandom.uuid,
          action: 'created',
          user: user)
      end

      it 'does not create deliveries for unsupported events' do
        expect { described_class.new.call(activity) }
          .not_to change(Webhooks::Delivery, :count)
      end
    end

    context 'with activities without project' do
      let!(:subscription) { create(:webhook_subscription, events: ['user.created'], project: nil) }
      let(:activity) do
        create(:activity,
          item: user,
          item_type: 'User',
          action: 'created',
          user: user,
          project_id: nil)
      end

      it 'creates deliveries for global subscriptions' do
        expect { described_class.new.call(activity) }
          .to change(Webhooks::Delivery, :count).by(1)
      end
    end
  end
end
