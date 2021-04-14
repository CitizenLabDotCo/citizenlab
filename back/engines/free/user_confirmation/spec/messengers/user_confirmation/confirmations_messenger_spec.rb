require 'rails_helper'

RSpec.describe UserConfirmation::ConfirmationsMailer, type: :mailer do
  describe 'send_confirmation_code' do
    let!(:user) { create(:user) }
    let(:mail) { described_class.with(user: user).send_confirmation_code.deliver_now }

    it 'renders the subject' do
      expect(mail.subject).to start_with('Welcome')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([user.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'shows the code to the user' do
      expect(mail.body.encoded).to match(user.confirmation_code)
    end
  end
end
