module FlagInappropriateContent
  module Patches
    module SideFxIdeaService

      SUPPORTED_ATTRS = [:title_multiloc, :body_multiloc, :location_description].freeze

      def after_create idea, user
        super
        ToxicityDetectionJob.perform_later idea, attributes: SUPPORTED_ATTRS
      end

      def after_update idea, user
        atrs = updated_supported_attrs idea
        ToxicityDetectionJob.perform_later idea, attributes: atrs if atrs.present? # before super to reliably detect attribute changes
        super
      end

      private

      def updated_supported_attrs idea
        SUPPORTED_ATTRS.select do |atr|
          idea.saved_change_to_attribute? atr
        end
      end
    end
  end
end
