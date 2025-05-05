# frozen_string_literal: true

module ParticipationMethod
  class CommonGround < Base
    def self.method_str
      'common_ground'
    end

    # Reactions are used for voting.
    def supports_reacting?
      true
    end

    def built_in_title_required?
      true
    end
  end
end
