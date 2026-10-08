# frozen_string_literal: true

module AIAssistant
  class ConversationPolicy < ApplicationPolicy
    # The only place that decides who may use the assistant. Widen it here, and in the
    # frontend permission rule, before opening the assistant to clients.
    def self.allowed?(user)
      !!user&.active? && user.super_admin?
    end

    class Scope < ApplicationPolicy::Scope
      def resolve
        ConversationPolicy.allowed?(user) ? scope.where(user:) : scope.none
      end
    end

    def show?
      self.class.allowed?(user) && record.user_id == user.id
    end

    def create?
      show? && record.context.present? && Context.for(record).accessible_by?(user)
    end

    def update?
      create?
    end
  end
end
