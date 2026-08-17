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

    it 'rejects a body over the segment limit' do
      over_limit = 'a' * ((153 * EmailCampaigns::Sms::SegmentedMessage::MAX_SEGMENTS) + 1)
      delivery = described_class.new(body: over_limit, status: 'sent')

      expect(delivery).not_to be_valid
      expect(delivery.errors[:segments_count]).to be_present
    end

    it 'accepts a body of exactly the segment limit' do
      at_limit = 'a' * (153 * EmailCampaigns::Sms::SegmentedMessage::MAX_SEGMENTS)

      expect(described_class.new(body: at_limit, status: 'sent')).to be_valid
    end
  end

  describe 'segments_count' do
    it 'is computed from the body at creation, before the message is sent' do
      delivery = described_class.create!(body: 'a' * 161, status: 'pending')

      expect(delivery.reload.segments_count).to eq(2)
    end

    it 'counts a unicode body on its own encoding' do
      delivery = described_class.create!(body: 'ж' * 71, status: 'pending')

      expect(delivery.reload.segments_count).to eq(2)
    end

    it 'is left alone once recorded, so an edited body never rewrites billing history' do
      delivery = described_class.create!(body: 'hi', status: 'pending')

      expect { delivery.update!(body: 'a' * 161) }.not_to change { delivery.reload.segments_count }.from(1)
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
