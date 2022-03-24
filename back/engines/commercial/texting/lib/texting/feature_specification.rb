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
  end
end
