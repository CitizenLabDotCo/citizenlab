# frozen_string_literal: true

require 'twilio-ruby'

class Texting::Sms::Providers::Twilio
  # https://support.twilio.com/hc/en-us/articles/115002943027-Understanding-Twilio-Rate-Limits-and-Message-Queues
  QUEUE_DURATION = 4.hours
  TOLL_FREE_SEGMENTS_PER_SECOND = 3 # We start with using Toll-free number in the US
  SEGMENTS_QUEUE = (QUEUE_DURATION * TOLL_FREE_SEGMENTS_PER_SECOND).to_i

  def send_msg(message, phone_number, status_callback: nil)
    rest_client.messages.create(body: message, to: phone_number, from: from, status_callback: status_callback)
    true
  rescue Twilio::REST::TwilioError => e
    ErrorReporter.report(e, extra: { message: message, phone_number: phone_number })
    false
  end

  # TODO: fetch current queue from Twilio
  def exeeds_queue_limit?(segments_count)
    segments_count > SEGMENTS_QUEUE
  end

  def request_valid?(url, request)
    signature = request.headers['X-Twilio-Signature']
    return false if signature.blank?

    validator = Twilio::Security::RequestValidator.new(auth_token)
    validator.validate(url, request.request_parameters, signature)
  end

  private

  # not sure it's thread safe https://github.com/twilio/twilio-ruby/issues/311
  def rest_client
    # At the moment, messaging is supported only in the US Twilio data centers
    # https://www.twilio.com/docs/global-infrastructure/regional-product-and-feature-availability
    # so we don't specify `region`
    Twilio::REST::Client.new(ENV['TWILIO_ACCOUNT_SID'], auth_token)
  end

  def auth_token
    ENV['TWILIO_AUTH_TOKEN']
  end

  def from
    app_configuration.settings('texting', 'from_number')
  end

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end
end
