# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestConfirmationCodeJob do
  subject(:job) { described_class.new }

  describe '#perform' do
    let(:user) { create(:user) }

    context 'when the user signs up with an email' do
      let(:user) { create(:unconfirmed_user, email: 'some_email@email.com') }

      it 'enqueues a "requested_confirmation_code" activity job' do
        expect { job.perform(user) }.to enqueue_job(LogActivityJob).with(user, 'requested_confirmation_code', user, anything, payload: { new_email: nil })
      end

      it 'changes the email confirmation code delivery timestamp' do
        expect { job.perform(user) }.to change { user.email_confirmation.reload.code_sent_at }
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

      it 'does not set the confirmation_required value to true is user already confirmed' do
        expect(user.confirmation_required?).to be true
        job.perform(user)
        expect(user.confirmation_required?).to be true
        user.email_confirmation.confirm!
        expect(user.confirmation_required?).to be false

        job.perform(user)
        expect(user.reload.confirmation_required?).to be false
      end

      it 'resets code_retry_count on the email_confirmation' do
        user.email_confirmation.update!(code_retry_count: 3)
        expect { job.perform(user) }.to change { user.email_confirmation.reload.code_retry_count }.to(0)
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

        it 'raises a record invalid error if the new email does not have a valid format' do
          expect { job.perform(user, new_email: 'invalid@email-com') }.to raise_error(ActiveRecord::RecordInvalid)

          expect(user).to be_invalid
          expect(user.errors.details).to eq({ email: [{ error: :invalid, value: 'invalid@email-com' }] })
          expect(user.reload.new_email).to be_nil
        end

        it 'raises a record invalid error if a user with the new email already exists' do
          create(:user, email: new_email)
          expect { job.perform(user, new_email: new_email) }.to raise_error(ActiveRecord::RecordInvalid)

          expect(user).to be_invalid
          expect(user.errors.details).to eq({ email: [{ error: :taken, value: new_email }] })
          expect(user.reload.new_email).to be_nil
        end

        it 'does not reset code_reset_count between successive requests' do
          job.perform(user, new_email: new_email)
          expect(user.new_email_confirmation.reload.code_reset_count).to eq 1
          job.perform(user, new_email: new_email)
          expect(user.new_email_confirmation.reload.code_reset_count).to eq 2
        end

        it 'resets code_retry_count on the new_email_confirmation' do
          user.new_email_confirmation.update!(code_retry_count: 3)
          expect { job.perform(user, new_email: new_email) }.to change { user.new_email_confirmation.reload.code_retry_count }.to(0)
        end

        it 'does not change the confirmation_required value of a confirmed user' do
          user = create(:unconfirmed_user)
          job.perform(user)
          expect(user.confirmation_required?).to be true
          user.email_confirmation.confirm!
          expect(user.confirmation_required?).to be false

          job.perform(user, new_email: new_email)
          expect(user.reload.confirmation_required?).to be false
        end
      end
    end

    context 'when the user has made too many reset requests' do
      let(:user) do
        create(:unconfirmed_user).tap { |u| u.email_confirmation.update!(code_reset_count: 5) }
      end

      it 'raises a too many resets on code error' do
        expect { job.perform(user) }.to raise_error(ActiveRecord::RecordInvalid)

        expect(user.email_confirmation).to be_invalid
        expect(user.email_confirmation.errors.details).to eq({ code_reset_count: [{ error: :less_than_or_equal_to, value: 6, count: 5 }] })
      end
    end
  end
end
