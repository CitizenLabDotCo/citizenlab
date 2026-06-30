# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestNewEmailConfirmationCodeJob do
  subject(:job) { described_class.new }

  describe '#perform' do
    let(:user) { create(:unconfirmed_user, email: 'some_email@email.com') }
    let(:new_email) { 'new@email.com' }

    it 'enqueues a "requested_confirmation_code" activity job with the new email' do
      expect { job.perform(user, new_email: new_email) }.to enqueue_job(LogActivityJob).with(user, 'requested_confirmation_code', user, anything, payload: { new_email: new_email })
    end

    it 'sets the user email temporarily in new_email' do
      job.perform(user, new_email: new_email)
      expect(user.new_email).to eq new_email
      expect(user.email).to eq 'some_email@email.com'
    end

    it 'changes the new_email confirmation code delivery timestamp' do
      expect { job.perform(user, new_email: new_email) }.to change { user.new_email_confirmation.reload.code_sent_at }
    end

    it 'sends the confirmation email' do
      expect { job.perform(user, new_email: new_email) }.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it 'records a delivery for the NewEmailConfirmation campaign' do
      expect { job.perform(user, new_email: new_email) }.to change(EmailCampaigns::Delivery, :count).by(1)
      delivery = EmailCampaigns::Delivery.order(:created_at).last
      expect(delivery.campaign).to be_a(EmailCampaigns::Campaigns::NewEmailConfirmation)
      expect(delivery.user).to eq(user)
    end

    it 'enqueues a code expiration job' do
      expect { job.perform(user, new_email: new_email) }.to enqueue_job(ExpireConfirmationCodeOrDeleteJob)
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
      user.email_confirmation.confirm!
      expect(user.confirmation_required?).to be false

      job.perform(user, new_email: new_email)
      expect(user.reload.confirmation_required?).to be false
    end
  end
end
