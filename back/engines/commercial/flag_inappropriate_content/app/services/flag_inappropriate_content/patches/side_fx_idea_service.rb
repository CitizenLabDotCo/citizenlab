# frozen_string_literal: true

module FlagInappropriateContent
  module Patches
    module SideFxIdeaService
      SUPPORTED_ATTRS = %i[title_multiloc body_multiloc location_description].freeze

      def after_create(idea, user, phase)
        super
        return unless idea.participation_method_on_creation.supports_toxicity_detection?

        ToxicityDetectionJob.perform_later idea, attributes: SUPPORTED_ATTRS
      end

      def after_update(idea, user)
        return super unless idea.participation_method_on_creation.supports_toxicity_detection?

        # before super to reliably detect attribute changes
        atrs = updated_supported_attrs idea
        if atrs.present?
          # retry all attributes to consider removing flag
          atrs = SUPPORTED_ATTRS if idea.inappropriate_content_flag
          ToxicityDetectionJob.perform_later idea, attributes: atrs
        end

        super
      end

      private

      def updated_supported_attrs(idea)
        SUPPORTED_ATTRS.select do |atr|
          idea.saved_change_to_attribute? atr
        end
      end
    end
  end
end
