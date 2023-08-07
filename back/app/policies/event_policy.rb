# frozen_string_literal: true

class EventPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      project_ids = Pundit.policy_scope(user, Project).pluck(:id)
      scope.where(project: project_ids)
    end
  end

  def create?
    ProjectPolicy.new(user, record.project).update?
  end

  def show?
    ProjectPolicy.new(user, record.project).show?
  end

  def update?
    ProjectPolicy.new(user, record.project).update?
  end

  def destroy?
    ProjectPolicy.new(user, record.project).update?
  end

  # For this action, Pundit is used in an unconventional manner. The record is a user
  # identifier (`attendee_id`) instead of an Event instance. See
  # `EventsController#index_by_attendee` for details.
  def index_by_attendee?
    attendee_id = record
    active? && (admin? || user.id == attendee_id)
  end
end
