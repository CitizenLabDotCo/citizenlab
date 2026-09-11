# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestMergeAccountConfirmationCodeJob do
  subject(:job) { described_class.new }

  describe '#perform' do
    # An email-less SSO account asking to be absorbed into the account that owns
    # target_email.
    let(:user) do
      create(:user).tap { |u| u.update_columns(email: nil, password_digest: nil) }
    end
    let(:target_email) { 'existing@example.org' }

    before { create(:user, email: target_email) }

    it 'creates the confirmation holding the address and sets the code delivery timestamp' do
      expect { job.perform(user, target_email: target_email) }
        .to change(MergeAccountConfirmation, :count).by(1)

      confirmation = user.reload.merge_account_confirmation
      expect(confirmation.target_email).to eq target_email
      expect(confirmation.code_sent_at).to be_present
      expect(confirmation.code).to be_present
    end

    # The address belongs to somebody else, so validate_not_duplicate_new_email
    # would reject it. It lives on the confirmation instead.
    it 'never writes the address to the user' do
      job.perform(user, target_email: target_email)

      user.reload
      expect(user.new_email).to be_nil
      expect(user.email).to be_nil
    end

    it 'records a delivery for the MergeAccountConfirmation campaign' do
      expect { job.perform(user, target_email: target_email) }
        .to change(EmailCampaigns::Delivery, :count).by(1)

      delivery = EmailCampaigns::Delivery.order(:created_at).last
      expect(delivery.campaign).to be_a(EmailCampaigns::Campaigns::MergeAccountConfirmation)
      expect(delivery.user).to eq user
    end

    it 'sends the code to the target address rather than the caller' do
      job.perform(user, target_email: target_email)

      expect(ActionMailer::Base.deliveries.last.to).to eq [target_email]
    end

    # Activities are admin-readable, and this one would record an address the user
    # merely typed.
    it 'keeps the address out of the activity payloads' do
      expect { job.perform(user, target_email: target_email) }
        .to enqueue_job(LogActivityJob).with(user, 'requested_confirmation_code', user, anything)
      expect(LogActivityJob).to have_been_enqueued
        .with(user, 'received_confirmation_code', user, anything)
    end

    it 'enqueues a code expiration job' do
      expect { job.perform(user, target_email: target_email) }
        .to enqueue_job(ExpireConfirmationCodeOrDeleteJob)
    end

    it 'counts successive requests against the reset budget' do
      job.perform(user, target_email: target_email)
      expect(user.merge_account_confirmation.reload.code_reset_count).to eq 1

      job.perform(user, target_email: target_email)
      expect(user.merge_account_confirmation.reload.code_reset_count).to eq 2
    end

    it 'moves the confirmation to a different address when the user changes their mind' do
      job.perform(user, target_email: target_email)
      job.perform(user, target_email: 'somebody-else@example.org')

      expect(user.reload.merge_account_confirmation.target_email).to eq 'somebody-else@example.org'
      expect(MergeAccountConfirmation.where(user_id: user.id).count).to eq 1
    end
  end
end
