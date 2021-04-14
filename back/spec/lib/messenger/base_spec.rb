# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Messenger::Base do
  let(:user) { create(:user) }

  context 'for a TestMessenger with a simple message' do
    class TestMessenger < Messenger::Base
      def send_a_message
        params[:body] = 'This is a message'
      end
    end

    describe '#send_a_message' do
      it 'returns a message object' do
        expect(TestMessenger.with(user: user).send_a_message).to be_a Messenger::Message
      end
    end

    describe '#deliver_later' do
      it 'enqueues a DeliveryJob' do
        expect { TestMessenger.with(user: user).send_a_message.deliver_later }.to have_enqueued_job(Messenger::DeliveryJob)
      end
    end

    describe '#deliver!' do
      it 'enqueues a DeliveryJob' do
        expect { TestMessenger.with(user: user).send_a_message.deliver! }.to have_enqueued_job(Messenger::DeliveryJob)
      end
    end
  end
end
