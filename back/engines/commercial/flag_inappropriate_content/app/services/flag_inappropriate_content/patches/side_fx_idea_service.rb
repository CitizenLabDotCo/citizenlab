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
        remove_flag_if_approved(idea)
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

      # Remove the inappropriate content flag (if any) when the idea is moved
      # from a non-public to a public status (= approved).
      def remove_flag_if_approved(idea)
        return unless idea.idea_status_id_previously_changed?
        return unless (flag = idea.inappropriate_content_flag)
        return unless idea.idea_status&.public_post?

        # Check if the previous status was non-public.
        previous_status = IdeaStatus.find_by(id: idea.idea_status_id_previous_change.first)
        return if previous_status&.public_post?

        # Transition from non-public to public status => remove flag
        flag.touch(:deleted_at)
        LogActivityJob.perform_later(flag, 'deleted', nil, Time.now.to_i)
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
