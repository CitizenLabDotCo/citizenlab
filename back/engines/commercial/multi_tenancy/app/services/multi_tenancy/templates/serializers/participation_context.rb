# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class ParticipationContext < Base
        attributes %i[
          commenting_enabled
          downvoting_enabled
          downvoting_limited_max
          downvoting_method
          ideas_order
          input_term
          max_budget
          min_budget
          participation_method
          poll_anonymous
          posting_enabled
          posting_limited_max
          posting_method
          presentation_mode
          upvoting_limited_max
          upvoting_method
          voting_enabled
        ]

        attribute(:survey_embed_url, if: :survey?)
        attribute(:survey_service, if: :survey?)
        # attribute(:document_annotation_embed_url, if: :document_annotation?)
      end
    end
  end
end
