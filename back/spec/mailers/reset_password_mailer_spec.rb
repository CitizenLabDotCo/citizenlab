# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ResetPasswordMailer do
  let_it_be(:user) { create(:user, locale: 'en') }
  let_it_be(:url) { 'https://example.com' }
  let_it_be(:mailer) { described_class.with(user: user, password_reset_url: url) }
  let_it_be(:mail) { mailer.send_reset_password.deliver_now }

  describe 'mailgun_headers' do
    it 'includes X-Mailgun-Variables and cl_tenant_id' do
      # We need to do this as we cannot directly access the true mailer instance
      # when using `described_class.with(...)` in the test setup.
      mailer_instance = nil
      allow(described_class).to receive(:new).and_wrap_original do |original, *args|
        mailer_instance = original.call(*args)
        allow(mailer_instance).to receive(:mailgun_headers).and_call_original
        mailer_instance
      end

      mailer.send_reset_password.deliver_now

      expect(mailer_instance.mailgun_headers.keys).to match_array %w[X-Mailgun-Variables X-Mailgun-Track]
      expect(JSON.parse(mailer_instance.mailgun_headers['X-Mailgun-Variables'])).to match(
        hash_including('cl_tenant_id' => instance_of(String))
      )
      expect(mailer_instance.mailgun_headers['X-Mailgun-Track']).to eq 'no'
    end
  end

  describe 'send_reset_password' do
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
    let_it_be(:recipient2) { create(:user, locale: 'nl-NL') }
    let_it_be(:mail2) { described_class.with(user: recipient2, password_reset_url: url).send_reset_password.deliver_now }

    it 'renders the mails in the correct language' do
      expect(mail.body.encoded).to include('You requested a password reset')
      expect(mail2.body.encoded).to include('Je vroeg een reset van je wachtwoord')
    end
  end
end
