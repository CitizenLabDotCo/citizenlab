require 'rails_helper'

RSpec.describe UserConfirmation::SendConfirmationCode do
  subject(:result) { described_class.call(context) }

  let(:context) { {} }

  context 'when the user signs up with a phone number' do
    before do
      context[:user] = create(:user, email: '+398234234234')
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'enqueues an sms delivery job' do
      expect { result }.to have_enqueued_job(Messenger::DeliveryJob).with(user: context[:user]).exactly(1).times
    end
  end

  context 'when the user signs up with an email' do
    before do
      context[:user] = create(:user, email: 'some_email@email.com')
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'enqueues an email delivery job' do
      expect { result }.to have_enqueued_job(ActionMailer::DeliveryJob).with(user: context[:user]).exactly(1).times
    end
  end
end
