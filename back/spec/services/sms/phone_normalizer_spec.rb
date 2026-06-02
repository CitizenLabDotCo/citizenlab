# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Sms::PhoneNormalizer do
  describe '.normalize' do
    it 'strips formatting characters' do
      expect(described_class.normalize('+1 (415) 555-2671')).to eq('+14155552671')
    end

    it 'prepends + when missing' do
      expect(described_class.normalize('14155552671')).to eq('+14155552671')
    end

    it 'returns nil for blank input' do
      expect(described_class.normalize(nil)).to be_nil
      expect(described_class.normalize('')).to be_nil
    end
  end

  describe '.valid?' do
    it 'accepts valid E.164' do
      expect(described_class.valid?('+14155552671')).to be true
    end

    it 'normalizes before validating' do
      expect(described_class.valid?('+1 (415) 555-2671')).to be true
    end

    it 'rejects numbers that are too short' do
      expect(described_class.valid?('+1234')).to be false
    end

    it 'rejects numbers starting with 0' do
      expect(described_class.valid?('+04155552671')).to be false
    end

    it 'rejects blank input' do
      expect(described_class.valid?(nil)).to be false
    end
  end
end
