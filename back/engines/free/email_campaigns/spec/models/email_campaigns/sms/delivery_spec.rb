# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::Delivery do
  describe 'validations' do
    it 'requires phone_number, body, and a valid status' do
      delivery = described_class.new
      expect(delivery).not_to be_valid
      expect(delivery.errors[:phone_number]).to be_present
      expect(delivery.errors[:body]).to be_present
      expect(delivery.errors[:status]).to be_present
    end

    it 'rejects an unknown status' do
      delivery = described_class.new(phone_number: '+14155552671', body: 'hi', status: 'martian')
      expect(delivery).not_to be_valid
      expect(delivery.errors[:status]).to be_present
    end

    it 'is valid with a known status' do
      delivery = described_class.new(phone_number: '+14155552671', body: 'hi', status: 'sent')
      expect(delivery).to be_valid
    end
  end

  describe '#advance_status!' do
    subject(:delivery) { described_class.create!(phone_number: '+14155552671', body: 'hi', status: 'sent') }

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
