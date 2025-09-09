# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ConfirmationsMailer do
  describe 'send_confirmation_code' do
    let_it_be(:user) { create(:user_with_confirmation, email: 'some_email@email.com') }
    let_it_be(:mailer) { described_class.with(user: user) }
    let_it_be(:message) { mailer.send_confirmation_code.deliver_now }

    before do
      SettingsService.new.activate_feature! 'user_confirmation'
    end

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

        mailer.send_confirmation_code.deliver_now

        expect(mailer_instance.mailgun_headers.keys).to match_array %w[X-Mailgun-Variables]
        expect(JSON.parse(mailer_instance.mailgun_headers['X-Mailgun-Variables'])).to match(
          hash_including('cl_tenant_id' => instance_of(String))
        )
      end
    end

    it 'renders the subject' do
      expect(message.subject).to start_with('Confirm your email address')
    end

    it 'renders the receiver email address' do
      expect(message.to).to eq(['some_email@email.com'])
    end

    context "when receiver's email address changes" do
      let(:user) { create(:user_with_confirmation, email: 'just_some_email@email.com') }
      let(:message) { described_class.with(user: user).send_confirmation_code.deliver_now }

      it "renders the receiver's new email address when present" do
        user.update!(new_email: 'new@email.com')
        expect(message.to).to eq(['new@email.com'])
      end
    end

    it 'renders the sender address' do
      expect(message.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(message.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'shows the code to the user' do
      expect(message.body.encoded).to match(user.email_confirmation_code)
    end
  end

  describe 'when sent to users with a different locale set for each' do
    let_it_be(:recipient1) { create(:user, locale: 'en') }
    let_it_be(:recipient2) { create(:user, locale: 'nl-NL') }

    let_it_be(:mail1) { described_class.with(user: recipient1).send_confirmation_code.deliver_now }
    let_it_be(:mail2) { described_class.with(user: recipient2).send_confirmation_code.deliver_now }

    it 'renders the mails in the correct language' do
      expect(mail1.body.encoded).to include('Confirm your email address')
      expect(mail2.body.encoded).to include('Bevestig je e-mailadres')
    end
  end
end
