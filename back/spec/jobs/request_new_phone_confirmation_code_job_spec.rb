# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestNewPhoneConfirmationCodeJob do
  subject(:job) { described_class.new }

  let(:user) { create(:user) }
  let(:new_phone) { '+14155552671' }

  # The OTP is sent synchronously (perform_now) inside the job, so the provider
  # is actually invoked.
  include_context 'with stubbed SMS provider'

  # In the real flow the confirmation is created by the controller's
  # ensure_new_phone_confirmation before_action; the job assumes it exists.
  before { user.create_new_phone_confirmation! }

  it 'stores the number as the pending new_phone, leaving phone unset' do
    job.perform(user, new_phone: new_phone)
    expect(user.reload.new_phone).to eq new_phone
    expect(user.phone).to be_nil
  end

  it 'creates a campaign-linked EmailCampaigns::Sms::Delivery for the user' do
    expect { job.perform(user, new_phone: new_phone) }
      .to change(EmailCampaigns::Sms::Delivery, :count).by(1)

    delivery = EmailCampaigns::Sms::Delivery.last
    expect(delivery.user_id).to eq user.id
    expect(delivery.campaign).to be_a(EmailCampaigns::Campaigns::NewPhoneConfirmation)
  end

  it 'sends the code synchronously to the pending new phone number, not via a background job' do
    expect { job.perform(user, new_phone: new_phone) }
      .not_to have_enqueued_job(EmailCampaigns::Sms::SendJob)

    code = user.new_phone_confirmation.code
    expect(sms_provider).to have_received(:send).with(to: new_phone, body: a_string_including(code))
  end

  it 'sets the code delivery timestamp and resets the retry count' do
    user.new_phone_confirmation.update!(code_retry_count: 3)
    expect { job.perform(user, new_phone: new_phone) }
      .to change { user.new_phone_confirmation.reload.code_sent_at }
    expect(user.new_phone_confirmation.reload.code_retry_count).to eq 0
  end

  it 'enqueues a code expiration job' do
    expect { job.perform(user, new_phone: new_phone) }
      .to enqueue_job(ExpireConfirmationCodeOrDeleteJob)
  end

  it 'enqueues a "requested_confirmation_code" activity job with the new phone number' do
    expect { job.perform(user, new_phone: new_phone) }
      .to enqueue_job(LogActivityJob)
      .with(user, 'requested_confirmation_code', user, anything, payload: { new_phone: new_phone })
  end

  it 'raises a record invalid error for an invalid phone number and does not persist it' do
    expect { job.perform(user, new_phone: 'not-a-number') }.to raise_error(ActiveRecord::RecordInvalid)
    expect(user.reload.new_phone).to be_nil
  end
end
