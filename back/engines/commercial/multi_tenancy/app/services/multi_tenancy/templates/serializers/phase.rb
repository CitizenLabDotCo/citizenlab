# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Phase < Base
        ref_attribute :project

        attributes %i[
          title_multiloc
          description_multiloc
          campaigns_settings
          commenting_enabled
          reacting_dislike_enabled
          reacting_dislike_limited_max
          reacting_dislike_method
          ideas_order
          input_term
          participation_method
          poll_anonymous
          posting_enabled
          posting_limited_max
          posting_method
          presentation_mode
          reacting_like_limited_max
          reacting_like_method
          reacting_enabled
          baskets_count
          votes_count
        ]

        attribute(:start_at) { |phase| serialize_timestamp(phase.start_at) }
        attribute(:end_at) { |phase| serialize_timestamp(phase.end_at) }

        attribute(:voting_method, if: :voting?)
        attribute(:voting_max_total, if: :voting?)
        attribute(:voting_min_total, if: :voting?)
        attribute(:voting_max_votes_per_idea, if: :voting?)
        attribute(:voting_term_singular_multiloc, if: :voting?)
        attribute(:voting_term_plural_multiloc, if: :voting?)
        attribute(:survey_embed_url, if: :survey?)
        attribute(:survey_service, if: :survey?)
        attribute(:document_annotation_embed_url, if: :document_annotation?)
        attribute(:native_survey_title_multiloc, if: :native_survey?)
        attribute(:native_survey_button_multiloc, if: :native_survey?)
      end
    end
  end
end
