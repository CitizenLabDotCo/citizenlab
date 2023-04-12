# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DeliverConfirmationCode do
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

    it 'enqueues email delivery job' do
      result
      last_email = ActionMailer::Base.deliveries.last
      expect(last_email.to).to include context[:user].reload.email
    end

    it 'enqueues email with the confirmation' do
      result
      last_email = ActionMailer::Base.deliveries.last
      expect(last_email.body.encoded).to include context[:user].reload.email_confirmation_code
    end
  end

  context 'when the user has changed their email' do
    before do
      context[:user] = create(:user_with_confirmation, email: 'some_email@email.com', new_email: 'new@email.com')
    end

    it 'enqueues email delivery job to the changed email address' do
      result
      last_email = ActionMailer::Base.deliveries.last
      expect(last_email.to).to include context[:user].reload.new_email
    end
  end
end
