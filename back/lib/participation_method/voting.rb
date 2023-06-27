# frozen_string_literal: true

module ParticipationMethod
  class Voting < Ideation
    def posting_allowed?
      false
    end

    def sign_in_required_for_posting?
      true
    end
  end
end
