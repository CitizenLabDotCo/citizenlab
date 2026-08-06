# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::CleanupDeliveriesJob do
  describe '#perform' do
    before do
      allow(Resolv).to receive(:getaddresses).with(a_string_matching(/webhook.example.com.*/)).and_return(['93.184.216.34'])
    end

    let(:subscription) { create(:webhook_subscription) }
    let(:activity) { create(:idea_created_activity) }

    context 'with pending deliveries' do
      let!(:old_pending) do
        create(:webhook_delivery,
          subscription: subscription,
          activity: activity,
          status: 'pending',
          created_at: 31.days.ago)
      end

      it 'does not delete pending deliveries' do
        expect { described_class.perform_now }
          .not_to change { Webhooks::Delivery.where(status: 'pending').count }
      end

      it 'keeps old pending deliveries' do
        described_class.perform_now

        expect(Webhooks::Delivery.exists?(old_pending.id)).to be true
      end
    end

    context 'with mixed old and recent deliveries' do
      before do
        # Old deliveries (should be deleted)
        create_list(:webhook_delivery, 3, :succeeded,
          subscription: subscription,
          activity: activity,
          created_at: 35.days.ago)
        create_list(:webhook_delivery, 2, :failed,
          subscription: subscription,
          activity: activity,
          created_at: 40.days.ago)

        # Recent deliveries (should be kept)
        create_list(:webhook_delivery, 5, :succeeded,
          subscription: subscription,
          activity: activity,
          created_at: 20.days.ago)
        create_list(:webhook_delivery, 3, :failed,
          subscription: subscription,
          activity: activity,
          created_at: 15.days.ago)

        # Pending (should be kept regardless of age)
        create(:webhook_delivery,
          subscription: subscription,
          activity: activity,
          status: 'pending',
          created_at: 45.days.ago)
      end

      it 'deletes only old successful and failed deliveries' do
        expect { described_class.perform_now }
          .to change(Webhooks::Delivery, :count).by(-5)
      end

      it 'keeps all recent deliveries' do
        described_class.perform_now

        expect(Webhooks::Delivery.succeeded.where('created_at > ?', 30.days.ago).count).to eq(5)
        expect(Webhooks::Delivery.failed.where('created_at > ?', 30.days.ago).count).to eq(3)
      end

      it 'keeps all pending deliveries' do
        described_class.perform_now

        expect(Webhooks::Delivery.where(status: 'pending').count).to eq(1)
      end
    end

    context 'with no deliveries at all' do
      it 'does not raise error' do
        expect { described_class.perform_now }.not_to raise_error
      end
    end
  end
end
