# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Phase < ParticipationContext
        ref_attribute :project

        attributes %i[title_multiloc description_multiloc campaigns_settings]
        attribute(:start_at) { |phase| serialize_timestamp(phase.start_at) }
        attribute(:end_at) { |phase| serialize_timestamp(phase.end_at) }

        attribute(:survey_embed_url, if: :survey?)
        attribute(:survey_service, if: :survey?)
        attribute(:document_annotation_embed_url, if: :document_annotation?)
      end
    end
  end
end
