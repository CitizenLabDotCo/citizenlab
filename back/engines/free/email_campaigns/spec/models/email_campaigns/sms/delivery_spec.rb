# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::Delivery do
  describe 'validations' do
    it 'requires body and a valid status' do
      delivery = described_class.new
      expect(delivery).not_to be_valid
      expect(delivery.errors[:body]).to be_present
      expect(delivery.errors[:status]).to be_present
    end

    it 'rejects an unknown status' do
      delivery = described_class.new(body: 'hi', status: 'martian')
      expect(delivery).not_to be_valid
      expect(delivery.errors[:status]).to be_present
    end

    it 'is valid with a known status' do
      delivery = described_class.new(body: 'hi', status: 'sent')
      expect(delivery).to be_valid
    end

    it 'rejects a non-positive segments count' do
      delivery = described_class.new(body: 'hi', status: 'sent', segments_count: 0)
      expect(delivery).not_to be_valid
      expect(delivery.errors[:segments_count]).to be_present
    end
  end

  describe '#awaiting_segments_count?' do
    it 'is true once a message reached a terminal status with no count yet' do
      delivery = described_class.new(body: 'hi', status: 'delivered', message_sid: 'SM_1')
      expect(delivery).to be_awaiting_segments_count
    end

    it 'is false while the message is still on its way' do
      delivery = described_class.new(body: 'hi', status: 'sent', message_sid: 'SM_1')
      expect(delivery).not_to be_awaiting_segments_count
    end

    it 'is false for a delivery that never reached the provider' do
      delivery = described_class.new(body: 'hi', status: 'errored')
      expect(delivery).not_to be_awaiting_segments_count
    end

    it 'is false once the count is known' do
      delivery = described_class.new(body: 'hi', status: 'delivered', message_sid: 'SM_1', segments_count: 2)
      expect(delivery).not_to be_awaiting_segments_count
    end
  end

  describe '#record_segments_count!' do
    subject(:delivery) { described_class.create!(body: 'hi', status: 'sent') }

    it 'stores and persists the reported count' do
      delivery.record_segments_count!(2)

      expect(delivery.reload.segments_count).to eq(2)
    end

    it 'stores the count the provider reports as a string' do
      delivery.record_segments_count!('2')

      expect(delivery.reload.segments_count).to eq(2)
    end

    it 'ignores a missing count, leaving an already recorded one in place' do
      delivery.record_segments_count!(2)

      expect { delivery.record_segments_count!(nil) }.not_to change { delivery.reload.segments_count }.from(2)
    end

    it 'ignores the 0 Twilio reports before the message is segmented' do
      expect { delivery.record_segments_count!('0') }.not_to change { delivery.reload.segments_count }.from(nil)
    end
  end

  describe '#campaign_use_case' do
    it 'reads the use case off the campaign that triggered the send' do
      delivery = described_class.create!(body: 'hi', status: 'sent', campaign: create(:sms_manual_campaign))

      expect(delivery.campaign_use_case).to eq(EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS)
    end

    it 'is nil for an unlinked preview send' do
      delivery = described_class.create!(body: 'hi', status: 'sent')

      expect(delivery.campaign_use_case).to be_nil
    end
  end

  describe '#advance_status!' do
    subject(:delivery) { described_class.create!(body: 'hi', status: 'sent') }

    it 'advances and persists when the new status is further along' do
      expect(delivery.advance_status!('delivered')).to be(true)
      expect(delivery.reload.status).to eq('delivered')
    end

    it 'does not regress when an earlier status arrives out of order' do
      delivery.advance_status!('delivered')

      expect(delivery.advance_status!('sent')).to be(false)
      expect(delivery.reload.status).to eq('delivered')
    end

    it 'keeps the first terminal outcome when another terminal status arrives' do
      delivery.advance_status!('delivered')

      expect(delivery.advance_status!('failed')).to be(false)
      expect(delivery.reload.status).to eq('delivered')
    end

    it 'raises on an unknown status' do
      expect { delivery.advance_status!('martian') }.to raise_error(ArgumentError)
    end
  end
end
