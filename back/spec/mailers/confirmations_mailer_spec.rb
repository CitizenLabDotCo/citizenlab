# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ConfirmationsMailer do
  describe 'send_confirmation_code' do
    let!(:user) { create :user_with_confirmation, email: 'some_email@email.com' }
    let(:message) { described_class.with(user: user).send_confirmation_code.deliver_now }

    before do
      SettingsService.new.activate_feature! 'user_confirmation'
    end

    it 'renders the subject' do
      expect(message.subject).to start_with('Confirm your email address')
    end

    it 'renders the receiver email address' do
      expect(message.to).to eq(['some_email@email.com'])
    end

    it "renders the receiver's new email address when present" do
      user.update!(new_email: 'new@email.com')
      expect(message.to).to eq(['new@email.com'])
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
end
