# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestEmailConfirmationCodeJob do
  subject(:job) { described_class.new }

  describe '#perform' do
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

      it 'records a delivery for the EmailConfirmation campaign' do
        expect { job.perform(user) }.to change(EmailCampaigns::Delivery, :count).by(1)
        delivery = EmailCampaigns::Delivery.order(:created_at).last
        expect(delivery.campaign).to be_a(EmailCampaigns::Campaigns::EmailConfirmation)
        expect(delivery.user).to eq(user)
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
