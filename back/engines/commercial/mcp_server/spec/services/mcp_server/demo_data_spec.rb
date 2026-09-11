# frozen_string_literal: true

require 'rails_helper'

describe McpServer::DemoData do
  describe '.demo_users' do
    it 'returns only users on the demo email domain' do
      demo_user = create(:user, email: "jane.doe.abcd@#{described_class::EMAIL_DOMAIN}")
      create(:user)

      expect(described_class.demo_users).to eq [demo_user]
    end
  end

  describe '.build_author' do
    it 'builds a valid, confirmed user on the demo domain without a password' do
      registered_at = 3.days.ago
      author = described_class.build_author(registered_at)

      expect(author.save).to be true
      expect(author.email).to end_with("@#{described_class::EMAIL_DOMAIN}")
      expect(author.password_digest).to be_nil
      expect(author.confirmation_required?).to be false
      expect(author.registration_completed_at).to be_within(1.second).of(registered_at)
      expect(author.created_at).to be_within(1.second).of(registered_at)
      expect(AppConfiguration.instance.settings('core', 'locales')).to include(author.locale)
    end

    it 'builds a valid email from names with apostrophes and accents' do
      allow(Faker::Name).to receive_messages(first_name: 'Zoë', last_name: "O'Conner")

      author = described_class.build_author(Time.zone.now)

      expect(author.save).to be true
      expect(author.email).to match(/\Azoe\.o\.conner\.\h{8}@/)
    end
  end

  describe '.sample_times' do
    it 'returns times within the range, never in the future' do
      from = 30.days.ago
      times = described_class.sample_times(20, from: from, to: 10.days.from_now)

      expect(times.size).to eq(20)
      expect(times).to all(be_between(from, Time.zone.now))
    end

    it 'keeps times within a range that ended in the past' do
      from = 30.days.ago
      to = 10.days.ago

      expect(described_class.sample_times(20, from: from, to: to)).to all(be_between(from, to))
    end

    it 'returns the current time when the range lies in the future' do
      times = described_class.sample_times(3, from: 2.days.from_now, to: 10.days.from_now)

      expect(times).to all(be_within(1.second).of(Time.zone.now))
    end
  end
end
