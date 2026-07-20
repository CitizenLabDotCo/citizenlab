# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Phase < Base
        ref_attribute :project

        attributes %i[
          allow_anonymous_participation
          allow_multiple_responses
          available_views
          baskets_count
          commenting_enabled
          description_multiloc
          draft_description_multiloc
          expire_days_limit
          ideas_order
          input_term
          participation_method
          placement_type
          poll_anonymous
          prescreening_mode
          presentation_mode
          reacting_dislike_enabled
          reacting_dislike_limited_max
          reacting_dislike_method
          reacting_enabled
          reacting_like_limited_max
          reacting_like_method
          reacting_threshold
          similarity_enabled
          similarity_threshold_body
          similarity_threshold_title
          submission_enabled
          title_multiloc
          vote_term
          votes_count
          voting_filtering_enabled
          voting_term_plural_multiloc
          voting_term_singular_multiloc
        ]

        attribute(:start_at) { |phase| serialize_timestamp(phase.start_at) }
        attribute(:end_at) { |phase| serialize_timestamp(phase.end_at) }

        attribute(:voting_method, if: :voting?)
        attribute(:voting_max_total, if: :voting?)
        attribute(:voting_min_total, if: :voting?)
        attribute(:voting_max_votes_per_idea, if: :voting?)
        attribute(:voting_min_selected_options, if: :voting?)
        attribute(:autoshare_results_enabled, if: :voting?)
        attribute(:survey_embed_url, if: :survey?)
        attribute(:survey_service, if: :survey?)
        attribute(:survey_popup_frequency, if: :survey?)
        attribute(:document_annotation_embed_url, if: :document_annotation?)
        attribute(:native_survey_title_multiloc, if: proc { |phase| phase.pmethod.supports_survey_form? })
        attribute(:native_survey_button_multiloc, if: proc { |phase| phase.pmethod.supports_survey_form? })
      end
    end
  end
end
