# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SendConfirmationCode do
  subject(:result) { described_class.call(context) }

  let(:context) { {} }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  context 'when the user signs up with a phone number' do
    before do
      enable_phone_login
      context[:user] = create(:user_with_confirmation, email: '398234234234')
    end

    it 'returns a registration_method error, since phones are not confirmable' do
      expect(result.errors[:registration_method]).to be_present
    end
  end

  context 'when the user signs up with an email' do
    before do
      context[:user] = create(:user_with_confirmation, email: 'some_email@email.com')
    end

    it 'changes the email confirmation code delivery timestamp' do
      expect { result }.to change(context[:user], :email_confirmation_code_sent_at)
    end

    it 'enqueues the confirmation email' do
      expect { result }.to have_enqueued_mail(ConfirmationsMailer, :send_confirmation_code).with(params: { user: context[:user] }, args: [])
    end
  end
end
