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
end
