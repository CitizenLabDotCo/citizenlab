# frozen_string_literal: true

module ParticipationMethod
  class Survey < Base
    def self.method_str
      'survey'
    end

    def supports_permitted_by_everyone?
      true
    end

    def participations
      {} # Quick fix for failing specs.
    end
  end
end
