# frozen_string_literal: true

class Events::AttendancePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      raise Pundit::NotAuthorizedError unless user&.active? && user&.admin?

      scope.all
    end
  end

  def create?
    active? && user.id == record.attendee_id
  end

  def destroy?
    active? && (admin? || user.id == record.attendee_id)
  end
end
