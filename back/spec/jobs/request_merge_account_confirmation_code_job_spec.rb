# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestMergeAccountConfirmationCodeJob do
  subject(:job) { described_class.new }

  describe '#perform' do
    # An email-less SSO account asking to be merged into the account that owns
    # merge_target_email.
    let(:user) do
      create(:user).tap { |u| u.update_columns(email: nil, password_digest: nil) }
    end
    let(:merge_target_email) { 'existing@example.org' }

    before { create(:user, email: merge_target_email) }

    it 'holds the address on the user and issues a code' do
      expect { job.perform(user, merge_target_email: merge_target_email) }
        .to change(MergeAccountConfirmation, :count).by(1)

      user.reload
      expect(user.merge_target_email).to eq merge_target_email
      expect(user.merge_account_confirmation.code).to be_present
      expect(user.merge_account_confirmation.code_sent_at).to be_present
    end

    # The address belongs to somebody else, so it is never a candidate for email.
    it 'never writes the address to email or new_email' do
      job.perform(user, merge_target_email: merge_target_email)

      user.reload
      expect(user.email).to be_nil
      expect(user.new_email).to be_nil
    end

    it 'replaces a pending new_email' do
      user.update_columns(new_email: 'pending@example.org')

      job.perform(user, merge_target_email: merge_target_email)

      expect(user.reload.new_email).to be_nil
    end

    it 'records a delivery for the MergeAccountConfirmation campaign' do
      expect { job.perform(user, merge_target_email: merge_target_email) }
        .to change(EmailCampaigns::Delivery, :count).by(1)

      delivery = EmailCampaigns::Delivery.order(:created_at).last
      expect(delivery.campaign).to be_a(EmailCampaigns::Campaigns::MergeAccountConfirmation)
      expect(delivery.user).to eq user
    end

    it 'sends the code to the target address rather than the caller' do
      job.perform(user, merge_target_email: merge_target_email)

      expect(ActionMailer::Base.deliveries.last.to).to eq [merge_target_email]
    end

    # Activities are admin-readable, and this one would record an address the user
    # merely typed.
    it 'keeps the address out of the activity payloads' do
      expect { job.perform(user, merge_target_email: merge_target_email) }
        .to enqueue_job(LogActivityJob).with(user, 'requested_confirmation_code', user, anything)
      expect(LogActivityJob).to have_been_enqueued
        .with(user, 'received_confirmation_code', user, anything)
    end

    it 'enqueues a code expiration job' do
      expect { job.perform(user, merge_target_email: merge_target_email) }
        .to enqueue_job(ExpireConfirmationCodeOrDeleteJob)
    end

    it 'counts successive requests against the reset budget' do
      job.perform(user, merge_target_email: merge_target_email)
      expect(user.merge_account_confirmation.reload.code_reset_count).to eq 1

      job.perform(user, merge_target_email: merge_target_email)
      expect(user.merge_account_confirmation.reload.code_reset_count).to eq 2
    end

    it 'moves to a different address when the user changes their mind' do
      job.perform(user, merge_target_email: merge_target_email)
      job.perform(user, merge_target_email: 'somebody-else@example.org')

      expect(user.reload.merge_target_email).to eq 'somebody-else@example.org'
      expect(MergeAccountConfirmation.where(user_id: user.id).count).to eq 1
    end
  end
end
