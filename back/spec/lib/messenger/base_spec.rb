# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Messenger::Base do
  let(:user) { create(:user) }

  context 'for a TestMessenger with a simple message' do
    class TestMessenger < Messenger::Base
      def send_a_message
        params[:body] = 'This is a message'
        params[:to] = params[:user].email
      end
    end

    describe '#send_a_message' do
      it 'returns self' do
        expect(TestMessenger.with(user: user).send_a_message).to be_a described_class
      end
    end

    describe '#encoded_message' do
      it 'returns the Message object for the action' do
        expect(TestMessenger.with(user: user).send_a_message.encoded_message).to be_a Messenger::Message
      end
    end

    describe '#deliver_later' do
      it 'enqueues a DeliveryJob' do
        expect { TestMessenger.with(user: user).send_a_message.deliver_later }.to have_enqueued_job(Messenger::DeliveryJob)
      end
    end

    describe '#deliver!' do
      it 'performs a DeliveryJob' do
        messenger = TestMessenger.with(user: user).send_a_message
        message = messenger.encoded_message
        expect { messenger.deliver! }.to change(message, :delivered?).from(false).to(true)
      end
    end
  end
end
