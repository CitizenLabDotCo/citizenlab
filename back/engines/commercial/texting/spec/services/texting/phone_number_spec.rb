# frozen_string_literal: true

require 'rails_helper'

describe Texting::PhoneNumber do
  describe '.valid?' do
    it 'returns true for valid phone numbers' do
      expect(described_class.valid?('+12345678911')).to be(true)
      expect(described_class.valid?('2345678911')).to be(true)
      expect(described_class.valid?("+#{'1' * 7}")).to be(true)
      expect(described_class.valid?("+#{'1' * 15}")).to be(true)
      expect(described_class.valid?("+#{'1' * 15}---")).to be(true)
      expect(described_class.valid?('+12345678911', country_codes: ['+123'])).to be(true)
      expect(described_class.valid?('+12345678911', country_codes: ['+111', '+123'])).to be(true)
    end

    it 'returns false for invalid phone numbers' do
      expect(described_class.valid?("+#{'1' * 6}")).to be(false)
      expect(described_class.valid?("+#{'1' * 16}")).to be(false)
      expect(described_class.valid?('+12345678911', country_codes: ['+111'])).to be(false)
      expect(described_class.valid?('+12345678911', country_codes: ['+111', '+222'])).to be(false)
    end
  end

  describe '.normalize' do
    it 'removes extra characters' do
      expect(described_class.normalize('+12345678911')).to eq('+12345678911')
      expect(described_class.normalize('+12 345-67--89  11')).to eq('+12345678911')
      expect(described_class.normalize('+12 (345) 67--89  11')).to eq('+12345678911')
    end
  end
end
