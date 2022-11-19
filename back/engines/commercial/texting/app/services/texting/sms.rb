# frozen_string_literal: true

require 'sms_tools'

class Texting::Sms
  class << self
    def provider
      Texting::Sms::Providers::Twilio.new
    end

    def segments_count(msg)
      sms_encoding = SmsTools::EncodingDetection.new(msg)
      sms_encoding.concatenated_parts
    end
  end
end
