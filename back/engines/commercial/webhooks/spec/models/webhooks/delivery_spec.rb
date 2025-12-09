# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::Delivery do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:webhook_delivery)).to be_valid
    end
  end

  describe 'validations' do
    it 'requires a status' do
      delivery = build(:webhook_delivery, status: nil)
      expect(delivery).not_to be_valid
    end

    it 'validates status is in allowed values' do
      delivery = build(:webhook_delivery, status: 'invalid')
      expect(delivery).not_to be_valid
    end

    it 'accepts valid statuses' do
      %w[pending success failed].each do |status|
        delivery = build(:webhook_delivery, status: status)
        expect(delivery).to be_valid
      end
    end

    it 'requires event_type' do
      delivery = build(:webhook_delivery, event_type: nil)
      expect(delivery).not_to be_valid
    end
  end

  describe 'scopes' do
    before do
      allow(Resolv).to receive(:getaddresses).with(a_string_matching(/webhook.example.com.*/)).and_return(['93.184.216.34'])
    end

    let!(:pending) { create(:webhook_delivery, status: 'pending') }
    let!(:succeeded) { create(:webhook_delivery, :succeeded) }
    let!(:failed) { create(:webhook_delivery, :failed) }

    describe '.pending' do
      it 'returns only pending deliveries' do
        expect(described_class.pending).to include(pending)
        expect(described_class.pending).not_to include(succeeded, failed)
      end
    end

    describe '.succeeded' do
      it 'returns only successful deliveries' do
        expect(described_class.succeeded).to include(succeeded)
        expect(described_class.succeeded).not_to include(pending, failed)
      end
    end

    describe '.failed' do
      it 'returns only failed deliveries' do
        expect(described_class.failed).to include(failed)
        expect(described_class.failed).not_to include(pending, succeeded)
      end
    end

    describe '.recent' do
      it 'orders by created_at descending' do
        old = create(:webhook_delivery, created_at: 2.days.ago)
        new = create(:webhook_delivery, created_at: 1.day.ago)

        expect(described_class.where(id: [old, new]).recent.first).to eq(new)
        expect(described_class.where(id: [old, new]).recent.last).to eq(old)
      end
    end

    describe '.older_than' do
      it 'returns deliveries older than given date' do
        old = create(:webhook_delivery, created_at: 31.days.ago)
        recent = create(:webhook_delivery, created_at: 1.day.ago)

        results = described_class.older_than(30.days.ago)
        expect(results).to include(old)
        expect(results).not_to include(recent)
      end
    end
  end
end
