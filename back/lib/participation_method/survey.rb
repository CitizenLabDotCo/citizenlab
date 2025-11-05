# frozen_string_literal: true

module ParticipationMethod
  class Survey < Base
    def self.method_str
      'survey'
    end

    def supports_permitted_by_everyone?
      true
    end
  end
end
