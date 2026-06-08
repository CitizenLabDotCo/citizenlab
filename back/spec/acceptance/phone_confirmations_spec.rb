# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phone confirmations' do
  explanation 'Set and verify a user phone number via an SMS one-time code'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    header_token_for @user
  end

  post 'web_api/v1/user/request_phone_confirmation_code' do
    with_options scope: :phone_confirmation do
      parameter :phone_number, 'The phone number to set and verify', required: false
    end

    let(:phone_number) { '+14155552671' }

    before do
      twilio = instance_double(Sms::Providers::Twilio, send: { message_sid: 'SM_1', status: 'queued' })
      allow(Sms::Providers::Twilio).to receive(:new).and_return(twilio)
    end

    example_request 'Request a phone confirmation code' do
      expect(response_status).to eq 200
      expect(@user.reload.phone_number).to eq '+14155552671'
      expect(@user.phone_confirmation.code).to be_present
    end
  end

  post 'web_api/v1/user/confirm_phone_code' do
    with_options scope: :phone_confirmation do
      parameter :code, 'The verification code received by SMS', required: true
    end

    let(:code) { '1234' }

    before do
      @user.update!(phone_number: '+14155552671')
      PhoneConfirmation.create!(user: @user, code: '1234', code_sent_at: Time.zone.now)
    end

    example_request 'Confirm a phone code' do
      expect(response_status).to eq 200
      expect(@user.reload.phone_verified?).to be true
    end

    example 'Rejects an invalid code', document: false do
      do_request(phone_confirmation: { code: '9999' })
      expect(response_status).to eq 422
      expect(@user.reload.phone_verified?).to be false
    end
  end
end
