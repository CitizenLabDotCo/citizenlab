# frozen_string_literal: true

module ParticipationMethod
  class Voting < Ideation
    def assign_defaults_for_participation_context
      participation_context.ideas_order ||= 'random'
    end

    def allowed_ideas_orders
      %w[random]
    end

    def sign_in_required_for_posting?
      true
    end
  end
end
