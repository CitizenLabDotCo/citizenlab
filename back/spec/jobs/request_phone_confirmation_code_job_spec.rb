# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestPhoneConfirmationCodeJob do
  subject(:job) { described_class.new }

  let(:phone) { '+14155552671' }
  let(:user) { create(:user, phone: phone) }

  # The OTP is sent synchronously (perform_now) inside the job, so the provider
  # is actually invoked.
  include_context 'with stubbed SMS provider'

  it 'creates a campaign-linked EmailCampaigns::Sms::Delivery for the user' do
    expect { job.perform(user) }
      .to change(EmailCampaigns::Sms::Delivery, :count).by(1)

    delivery = EmailCampaigns::Sms::Delivery.last
    expect(delivery.user_id).to eq user.id
    expect(delivery.campaign).to be_a(EmailCampaigns::Campaigns::PhoneConfirmation)
  end

  it 'sends the code synchronously to the confirmed phone number, not via a background job' do
    expect { job.perform(user) }
      .not_to have_enqueued_job(EmailCampaigns::Sms::SendJob)

    code = user.phone_confirmation.code
    expect(sms_provider).to have_received(:send)
      .with(to: phone, body: a_string_including(code), use_case: EmailCampaigns::Sms::UseCase::CONFIRMATION_CODES)
  end

  it 'sets the code delivery timestamp and resets the retry count' do
    user.find_or_create_confirmation(:phone_confirmation).update!(code_retry_count: 3)
    expect { job.perform(user) }
      .to change { user.phone_confirmation.reload.code_sent_at }
    expect(user.phone_confirmation.reload.code_retry_count).to eq 0
  end

  it 'creates the phone confirmation on demand' do
    expect(user.phone_confirmation).to be_nil

    expect { job.perform(user) }.to change(PhoneConfirmation, :count).by(1)
    expect(user.reload.phone_confirmation.code_sent_at).to be_present
  end

  it 'reuses an existing phone confirmation instead of replacing it' do
    confirmation = user.find_or_create_confirmation(:phone_confirmation)

    expect { job.perform(user) }.not_to change(PhoneConfirmation, :count)
    expect(user.reload.phone_confirmation.id).to eq confirmation.id
    expect(user.phone_confirmation.code_reset_count).to eq 1
  end

  it 'enqueues a code expiration job' do
    expect { job.perform(user) }
      .to enqueue_job(ExpireConfirmationCodeOrDeleteJob)
  end

  it 'enqueues a "requested_confirmation_code" activity job' do
    expect { job.perform(user) }
      .to enqueue_job(LogActivityJob)
      .with(user, 'requested_confirmation_code', user, anything, payload: { new_phone: nil })
  end
end
