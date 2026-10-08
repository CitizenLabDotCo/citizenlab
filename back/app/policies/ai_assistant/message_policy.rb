# frozen_string_literal: true

module AIAssistant
  class MessagePolicy < ApplicationPolicy
    def create?
      policy_for(record.conversation).update?
    end
  end
end
