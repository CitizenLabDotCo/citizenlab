# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestNewPhoneConfirmationCodeJob do
  subject(:job) { described_class.new }

  let(:user) { create(:user) }
  let(:new_phone_number) { '+14155552671' }

  before do
    SettingsService.new.activate_feature!('sms', settings: {
      'twilio_account_sid' => 'AC_test',
      'twilio_auth_token' => 'token',
      'twilio_phone_number' => '+15005550006'
    })
  end

  it 'stores the number as the pending new_phone_number, leaving phone_number unset' do
    job.perform(user, new_phone_number: new_phone_number)
    expect(user.reload.new_phone_number).to eq new_phone_number
    expect(user.phone_number).to be_nil
  end

  it 'creates a campaign-linked pending EmailCampaigns::Sms::Delivery to the new phone number' do
    expect { job.perform(user, new_phone_number: new_phone_number) }
      .to change(EmailCampaigns::Sms::Delivery, :count).by(1)

    delivery = EmailCampaigns::Sms::Delivery.last
    expect(delivery).to have_attributes(
      user_id: user.id,
      phone_number: new_phone_number,
      status: 'pending'
    )
    expect(delivery.campaign).to be_a(EmailCampaigns::Campaigns::PhoneConfirmation)
  end

  it 'enqueues an EmailCampaigns::Sms::SendJob for the created delivery' do
    job.perform(user, new_phone_number: new_phone_number)
    delivery = EmailCampaigns::Sms::Delivery.last
    expect(EmailCampaigns::Sms::SendJob).to have_been_enqueued.with(delivery.id)
  end

  it 'sets the code delivery timestamp and resets the retry count' do
    user.new_phone_confirmation.update!(code_retry_count: 3)
    expect { job.perform(user, new_phone_number: new_phone_number) }
      .to change { user.new_phone_confirmation.reload.code_sent_at }
    expect(user.new_phone_confirmation.reload.code_retry_count).to eq 0
  end

  it 'enqueues a code expiration job' do
    expect { job.perform(user, new_phone_number: new_phone_number) }
      .to enqueue_job(ExpireConfirmationCodeOrDeleteJob)
  end

  it 'enqueues a "requested_confirmation_code" activity job with the new phone number' do
    expect { job.perform(user, new_phone_number: new_phone_number) }
      .to enqueue_job(LogActivityJob)
      .with(user, 'requested_confirmation_code', user, anything, payload: { new_phone_number: new_phone_number })
  end

  it 'raises a record invalid error for an invalid phone number and does not persist it' do
    expect { job.perform(user, new_phone_number: 'not-a-number') }.to raise_error(ActiveRecord::RecordInvalid)
    expect(user.reload.new_phone_number).to be_nil
  end
end
