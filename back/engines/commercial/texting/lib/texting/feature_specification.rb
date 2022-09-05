# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module Texting
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    class << self
      def feature_name
        'texting'
      end

      def feature_title
        'Texting'
      end

      def feature_description
        'Texting via SMS. The feature is experimental, so please enable it only if you know what you are doing.'
      end

      def allowed_by_default
        false
      end

      def enabled_by_default
        false
      end
    end

    add_setting 'from_number', required: true, schema: {
      type: 'string',
      title: 'From number',
      description: 'The phone number to use as the sender. Contact the dev team to get it.'
    }

    add_setting 'monthly_sms_segments_limit', required: true, schema: {
      type: 'number',
      title: 'Monthly limit of sent SMS segments',
      description: 'How many segments platform can send per month to all users. See this article for what is a segment https://www.twilio.com/blog/2017/03/what-the-heck-is-a-segment.html',
      default: 100_000
    }

    add_setting 'recipient_country_calling_codes', required: false, schema: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^\+\d+$'
      },
      title: 'Recipient country calling codes',
      description: 'All recepients phone numbers will be validated to have one of these country codes. Each one should start with +. Use +1 for the US. Do not configure to skip validation. See the full list https://en.wikipedia.org/wiki/List_of_country_calling_codes'
    }
  end
end
