# frozen_string_literal: true

module ParticipationMethod
  class Information < Base
    def self.method_str
      'information'
    end

    def participations
      {} # Quick fix for failing specs.
    end
  end
end
