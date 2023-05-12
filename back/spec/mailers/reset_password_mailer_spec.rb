# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ResetPasswordMailer do
  describe 'send_reset_password' do
    let_it_be(:user) { create(:user, locale: 'en') }
    let_it_be(:url) { 'https://example.com' }
    let_it_be(:mail) { described_class.with(user: user, password_reset_url: url).send_reset_password.deliver_now }

    it 'renders the subject' do
      expect(mail.subject).to end_with('Reset your password')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([user.email])
    end

    it 'includes organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'includes reset password url' do
      expect(mail.body.encoded).to include(url)
    end
  end

  describe 'when sent to users with a different locale set for each' do
    let_it_be(:recipient1) { create(:user, locale: 'en') }
    let_it_be(:recipient2) { create(:user, locale: 'nl-BE') }
    let_it_be(:url) { 'https://example.com' }

    let_it_be(:mail1) { described_class.with(user: recipient1, password_reset_url: url).send_reset_password.deliver_now }
    let_it_be(:mail2) { described_class.with(user: recipient2, password_reset_url: url).send_reset_password.deliver_now }

    it 'renders the mails in the correct language' do
      expect(mail1.body.encoded).to include('You requested a password reset')
      expect(mail2.body.encoded).to include('Je vroeg een reset van je wachtwoord')
    end
  end
end
