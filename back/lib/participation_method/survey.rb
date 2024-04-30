# frozen_string_literal: true

module ParticipationMethod
  class Survey < Base
    def supports_everyone_permission?
      true
    end
  end
end
