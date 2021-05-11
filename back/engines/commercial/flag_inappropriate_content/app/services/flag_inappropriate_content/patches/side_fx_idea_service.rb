module FlagInappropriateContent
  module Patches
    module SideFxIdeaService

      SUPPORTED_ATTRS = [:title_multiloc, :body_multiloc, :location_description].freeze

      def after_create idea, user
        super
        ToxicityDetectionService.new.flag_toxicity! idea, attributes: SUPPORTED_ATTRS
      end

      def after_update idea, user
        ToxicityDetectionService.new.flag_toxicity! idea, attributes: updated_supported_attrs(idea) # before super to reliably detect attribute changes
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
