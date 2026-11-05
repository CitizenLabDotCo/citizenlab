# frozen_string_literal: true

module AIAssistant
  class ConversationPolicy < ApplicationPolicy
    # The only place that decides who may use the assistant. Before opening it to clients,
    # widen it here and in the frontend permission rule, and add permission checks to the
    # MCP tools that rely on this gate instead (e.g. get_form_fields).
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
      show? && record.subject.present? && Surface.for(record).accessible_by?(user)
    end

    def update?
      create?
    end
  end
end
