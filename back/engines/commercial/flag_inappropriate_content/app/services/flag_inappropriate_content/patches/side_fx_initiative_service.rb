module FlagInappropriateContent
  module Patches
    module SideFxInitiativeService

      SUPPORTED_ATTRS = [:title_multiloc, :body_multiloc, :location_description].freeze

      def after_create initiative, user
        super
        ToxicityDetectionJob.perform_later initiative, attributes: SUPPORTED_ATTRS
      end

      def after_update initiative, user
        atrs = updated_supported_attrs initiative
        ToxicityDetectionJob.perform_later initiative, attributes: atrs if atrs.present? # before super to reliably detect attribute changes
        super
      end

      private

      def updated_supported_attrs initiative
        SUPPORTED_ATTRS.select do |atr|
          initiative.saved_change_to_attribute? atr
        end
      end
    end
  end
end
