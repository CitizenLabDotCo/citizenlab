# frozen_string_literal: true
require 'twilio-ruby'

account_sid = ENV.fetch('TWILIO_ACCOUNT_SID')
auth_token = ENV.fetch('TWILIO_AUTH_TOKEN')

class WebApi::V1::PhoneConfirmationController < ApplicationController
  skip_after_action :verify_authorized

  def request_code
    twilio_client
      .api
      .v2010
      .messages
      .create(
        body: 'Your confirmation code is 123456',
        from: '+15017122661',
        to: '+15558675310'
      )

    head :ok
  end

  private

  def request_code_params
    params.permit(:phone_number)
  end

  def twilio_client
    @twilio_client ||= Twilio::REST::Client.new(account_sid, auth_token)
  end
end