# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestConfirmationCodeJob do
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

      context 'when the user signs up with an email' do
        let(:user) { create(:user_with_confirmation, email: 'some_email@email.com') }

        it 'enqueues a "requested_confirmation_code" activity job' do
          expect { job.perform(user) }.to enqueue_job(LogActivityJob).with(user, 'requested_confirmation_code', user, anything, payload: { new_email: nil })
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
          expect { job.perform(user) }.to enqueue_job(LogActivityJob).with(user, 'received_confirmation_code', user, anything, payload: { new_email: nil })
        end

        it 'does not set the new_email field' do
          expect { job.perform(user) }.not_to change(user, :new_email)
        end

        context 'when setting a new email' do
          let(:new_email) { 'new@email.com' }

          it 'enqueues a "requested_confirmation_code" activity job with the new email' do
            expect { job.perform(user, new_email: new_email) }.to enqueue_job(LogActivityJob).with(user, 'requested_confirmation_code', user, anything, payload: { new_email: new_email })
          end

          it 'sets the user email temporarily in new_email' do
            job.perform(user, new_email: new_email)
            expect(user.new_email).to eq new_email
            expect(user.email).to eq 'some_email@email.com'
          end

          it 'enqueues a "received_confirmation_code" activity job with the new email' do
            expect { job.perform(user, new_email: new_email) }.to enqueue_job(LogActivityJob).with(user, 'received_confirmation_code', user, anything, payload: { new_email: new_email })
          end

          it 'returns a validation error if the new email does not have a valid format' do
            job.perform(user, new_email: 'invalid@email-com')
            expect(user).to be_invalid
            expect(user.errors.details).to eq({ email: [{ error: :invalid, value: 'invalid@email-com' }] })
            expect(user.reload.new_email).to be_nil
          end

          it 'returns a validation error if a user with the new email already exists' do
            create(:user, email: new_email)
            job.perform(user, new_email: new_email)
            expect(user).to be_invalid
            expect(user.errors.details).to eq({ email: [{ error: :taken, value: new_email }] })
            expect(user.reload.new_email).to be_nil
          end
        end
      end

      context 'when the user is passwordless' do
        let(:user) { create(:user_no_password, email: 'some_email@email.com') }

        context 'when setting a new email' do
          let(:new_email) { 'new@email.com' }

          it 'sets the user email temporarily in new_email' do
            job.perform(user, new_email: new_email)
            expect(user.new_email).to eq new_email
            expect(user.email).to eq 'some_email@email.com'
          end
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
