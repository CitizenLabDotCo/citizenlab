# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class ParticipationContext < Base
        attributes %i[
          commenting_enabled
          downreacting_enabled
          reacting_dislike_limited_max
          reacting_dislike_method
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
          reacting_like_limited_max
          reacting_like_method
          reacting_enabled
        ]

        attribute(:survey_embed_url, if: :survey?)
        attribute(:survey_service, if: :survey?)
      end
    end
  end
end
