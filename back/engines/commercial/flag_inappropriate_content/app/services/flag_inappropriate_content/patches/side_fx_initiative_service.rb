# frozen_string_literal: true

module FlagInappropriateContent
  module Patches
    module SideFxInitiativeService
      SUPPORTED_ATTRS = %i[title_multiloc body_multiloc location_description].freeze

      def after_create(initiative, user)
        super
        ToxicityDetectionJob.perform_later initiative, attributes: SUPPORTED_ATTRS
      end

      def after_update(initiative, user, _old_cosponsor_ids)
        # before super to reliably detect attribute changes
        atrs = updated_supported_attrs initiative
        if atrs.present?
          # retry all attributes to consider removing flag
          atrs = SUPPORTED_ATTRS if initiative.inappropriate_content_flag
          ToxicityDetectionJob.perform_later initiative, attributes: atrs
        end

        super
      end

      private

      def updated_supported_attrs(initiative)
        SUPPORTED_ATTRS.select do |atr|
          initiative.saved_change_to_attribute? atr
        end
      end
    end
  end
end
