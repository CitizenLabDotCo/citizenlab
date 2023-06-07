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

        attribute(:voting_method, if: :voting?)
        attribute(:voting_max_total, if: :voting?)
        attribute(:voting_min_total, if: :voting?)
        attribute(:voting_max_votes_per_idea, if: :voting?)
        attribute(:voting_term, if: :voting?)

        attribute(:survey_embed_url, if: :survey?)
        attribute(:survey_service, if: :survey?)
      end
    end
  end
end
