require 'rails_helper'

RSpec.describe CommonPassword, type: :model do
  describe '.check' do
    before do
      described_class.delete_all
      described_class.import([
        described_class.new(password: 'password123'),
        described_class.new(password: 'qwerty'),
        described_class.new(password: '123456')
      ])
    end

    it 'returns true for common passwords' do
      expect(described_class.check('password123')).to be true
      expect(described_class.check('qwerty')).to be true
    end

    it 'returns false for uncommon passwords' do
      expect(described_class.check('unique-complex-pw123!')).to be false
    end
  end

  describe '.initialize!' do
    let(:test_file) { './spec/fixtures/common_passwords_test.txt' }
    
    before do
      File.write(test_file, "test123\npassword1\nqwerty\n")
      stub_const('CommonPassword::COMMON_PASSWORDS_FILE', test_file)
    end

    after do
      File.delete(test_file) if File.exist?(test_file)
    end

    it 'loads passwords from file' do
      described_class.initialize!
      expect(described_class.count).to eq 3
      expect(described_class.where(password: ['test123', 'password1', 'qwerty']).count).to eq 3
    end

    it 'clears existing passwords before loading' do
      described_class.create!(password: 'existing')
      described_class.initialize!
      expect(described_class.check('existing')).to be false
    end
  end
end
