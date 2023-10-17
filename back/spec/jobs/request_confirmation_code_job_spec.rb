# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestConfirmationCodeJob do # TODO: log activities, return validation error when invalid new email
  subject(:job) { described_class.new }

  describe '#perform' do
    let(:user) { create(:user) }

    describe 'when confirmation is turned off' do
      before { SettingsService.new.deactivate_feature! 'user_confirmation' }

      it 'raises an error' do
        expect { job.perform(user) }.to raise_error(RuntimeError)
      end
    end

    describe 'when confirmation is turned on' do
      before { SettingsService.new.activate_feature! 'user_confirmation' }

      context 'when the user signs up with a phone number' do
        before { enable_phone_login }

        let(:user) { create(:user_with_confirmation, email: '398234234234') }

        it 'raises and error, since phones are not confirmable' do
          expect { job.perform(user) }.to raise_error(RuntimeError)
        end
      end

      context 'when the user signs up with an email' do
        let(:user) { create(:user_with_confirmation, email: 'some_email@email.com') }

        it 'enqueues a "requested_confirmation_code" activity job' do
          expect { job.perform(user) }.to enqueue_job(LogActivityJob).with(user, 'requested_confirmation_code', user, anything)
        end

        it 'changes the email confirmation code delivery timestamp' do
          expect { job.perform(user) }.to change(user, :email_confirmation_code_sent_at)
        end

        it 'sends the confirmation email' do
          expect { job.perform(user) }.to change { ActionMailer::Base.deliveries.count }.by(1)
        end

        it 'enqueues a code expiration job' do
          expect { job.perform(user) }.to enqueue_job(ExpireConfirmationCodeOrDeleteJob)
        end

        it 'enqueues a "received_confirmation_code" activity job' do
          expect { job.perform(user) }.to enqueue_job(LogActivityJob).with(user, 'received_confirmation_code', user, anything)
        end
      end

      context 'when the user has made too many reset requests' do
        let(:user) do
          create(:user_with_confirmation).tap do |user|
            5.times do
              user.increment_confirmation_code_reset_count
            end
            user.save!
          end
        end

        it 'returns a too many resets on code error' do
          job.perform(user)
          expect(user).to be_invalid
          expect(user.errors.details).to eq({ email_confirmation_code_reset_count: [{ error: :less_than_or_equal_to, value: 6, count: 5 }] })
        end
      end
    end
  end
end
