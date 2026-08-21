# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestNewPhoneConfirmationCodeJob do
  subject(:job) { described_class.new }

  let(:new_phone) { '+14155552671' }
  let(:user) { create(:user, new_phone: new_phone) }

  # The OTP is sent synchronously (perform_now) inside the job, so the provider
  # is actually invoked.
  include_context 'with stubbed SMS provider'

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
    expect(sms_provider).to have_received(:send)
      .with(to: new_phone, body: a_string_including(code), use_case: EmailCampaigns::Sms::UseCase::CONFIRMATION_CODES)
  end

  it 'sets the code delivery timestamp and resets the retry count' do
    confirmation = user.find_or_create_confirmation(:new_phone_confirmation)
    confirmation.update!(code_retry_count: 3)
    expect { job.perform(user, new_phone: new_phone) }
      .to change { confirmation.reload.code_sent_at }
    expect(confirmation.reload.code_retry_count).to eq 0
  end

  # Users created before phone confirmations existed have no NewPhoneConfirmation row.
  it 'creates the new_phone confirmation on demand' do
    expect(user.new_phone_confirmation).to be_nil

    expect { job.perform(user, new_phone: new_phone) }.to change(NewPhoneConfirmation, :count).by(1)
    expect(user.reload.new_phone_confirmation.code_sent_at).to be_present
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
end
