# frozen_string_literal: true

require 'rails_helper'

RSpec.describe NewEmailConfirmationMailer do
  describe 'send_code' do
    let_it_be(:user) do
      user = create(:unconfirmed_user, email: 'some_email@email.com')
      RequestNewEmailConfirmationCodeJob.perform_now(user, new_email: 'new@email.com')
      user
    end
    let_it_be(:mailer) { described_class.with(user: user) }
    let_it_be(:message) { mailer.send_code.deliver_now }

    it 'renders the subject' do
      expect(message.subject).to start_with('Confirm your email address')
    end

    it 'sends to the new_email address rather than the current email' do
      expect(message.to).to eq(['new@email.com'])
    end

    it 'renders the sender address' do
      expect(message.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(message.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'shows the code from new_email_confirmation to the user' do
      expect(message.body.encoded).to match(user.new_email_confirmation.code)
    end
  end

  describe 'when sent to users with a different locale set for each' do
    let_it_be(:recipient1) { create(:user, locale: 'en', new_email: 'r1_new@email.com') }
    let_it_be(:recipient2) { create(:user, locale: 'nl-NL', new_email: 'r2_new@email.com') }

    let_it_be(:mail1) { described_class.with(user: recipient1).send_code.deliver_now }
    let_it_be(:mail2) { described_class.with(user: recipient2).send_code.deliver_now }

    it 'renders the mails in the correct language' do
      expect(mail1.body.encoded).to include('Confirm your email address')
      expect(mail2.body.encoded).to include('Bevestig je e-mailadres')
    end
  end
end
