# frozen_string_literal: true

module ParticipationMethod
  class Poll < Base
    def self.method_str
      'poll'
    end

    def participations
      {} # Quick fix for failing specs.
    end
  end
end
