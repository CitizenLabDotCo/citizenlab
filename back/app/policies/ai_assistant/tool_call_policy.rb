# frozen_string_literal: true

module AIAssistant
  class ToolCallPolicy < ApplicationPolicy
    def approve?
      policy_for(record.conversation).update?
    end

    def reject?
      approve?
    end
  end
end
