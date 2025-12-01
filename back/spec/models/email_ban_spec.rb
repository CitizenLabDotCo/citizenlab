# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailBan do
  subject { described_class.ban!('test@example.com') }

  it { is_expected.to validate_presence_of(:email_hash) }
  it { is_expected.to validate_presence_of(:normalized_email_hash) }
  it { is_expected.to belong_to(:banned_by).class_name('User').optional }

  describe '.ban!' do
    let(:email) { 'test.user+tag@gmail.com' }
    let(:admin) { create(:admin) }
    let(:reason) { 'Spam account' }

    it 'creates an email ban with hashed email' do
      ban = described_class.ban!(email, reason: reason, banned_by: admin)

      expect(ban).to be_persisted
      expect(ban.email_hash).to eq Digest::SHA256.hexdigest('test.user+tag@gmail.com')
      expect(ban.normalized_email_hash).to eq Digest::SHA256.hexdigest('testuser@gmail.com')
      expect(ban.reason).to eq(reason)
      expect(ban.banned_by).to eq(admin)
    end

    it 'allows multiple bans for the same email (no unique constraint)' do
      described_class.ban!(email)
      # No unique constraint - this creates a second record but banned? still works
      expect { described_class.ban!(email) }.to change(described_class, :count).by(1)
    end
  end

  describe '.banned?' do
    let(:original_email) { 'john.doe+tag@gmail.com' }

    before { described_class.ban!(original_email) }

    it 'returns true for banned emails' do
      expect(described_class.banned?(original_email)).to be true

      # Also check variations of the email
      expect(described_class.banned?('johndoe@gmail.com')).to be true
      expect(described_class.banned?('john.doe@gmail.com')).to be true
      expect(described_class.banned?('JOHNDOE@GMAIL.COM')).to be true
      expect(described_class.banned?('john.doe+newtag@gmail.com')).to be true
    end


    it 'returns false for different emails' do
      expect(described_class.banned?('other@gmail.com')).to be false
    end
  end

  describe '.find_for' do
    let(:email) { 'test.user@gmail.com' }
    let!(:ban) { described_class.ban!(email) }

    it 'finds ban by original email' do
      expect(described_class.find_for(email)).to eq ban
    end

    it 'finds ban by normalized email variation' do
      expect(described_class.find_for('testuser@gmail.com')).to eq ban
      expect(described_class.find_for('test.user+alias@gmail.com')).to eq ban
    end

    it 'returns nil for non-banned email' do
      expect(described_class.find_for('other@example.com')).to be_nil
    end
  end
end
