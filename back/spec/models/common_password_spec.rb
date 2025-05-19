require 'rails_helper'

RSpec.describe CommonPassword do
  describe '.check' do
    before do
      described_class.initialize! # This will use TEST_PASSWORDS_FILE to avoid issues on CI due to large file size of COMMON_PASSWORDS_FILE
    end

    it 'returns true for common passwords' do
      expect(described_class.check('password123')).to be true
      expect(described_class.check('letmein')).to be true
      expect(described_class.check('qwerty')).to be true
    end

    it 'returns false for uncommon passwords' do
      expect(described_class.check('unique-complex-pw123!')).to be false
    end
  end

  describe '.initialize!' do
    it 'clears existing passwords before loading' do
      described_class.create!(password: 'existing')
      described_class.initialize!
      expect(described_class.check('existing')).to be false
    end

    it 'loads all passwords from test file' do
      described_class.initialize!
      expect(described_class.count).to eq 5
      expect(described_class.where(password: %w[password123 letmein qwerty]).count).to eq 3
    end
  end
end
