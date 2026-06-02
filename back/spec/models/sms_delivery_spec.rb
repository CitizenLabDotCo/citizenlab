# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SmsDelivery do
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
end
