# frozen_string_literal: true

class PhasePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope, :context

    def initialize(context, scope)
      if context.is_a?(User) || context.nil?
        @user  = user
        @context = {}
      else
        @user = context[:user]
        @context = context
      end

      @scope = scope
    end

    def resolve
      project_ids = Pundit.policy_scope(context, Project).pluck(:id)
      scope.where(project: project_ids)
    end
  end

  def create?
    ProjectPolicy.new(user , record.project).update?
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

  def survey_results?
    active_moderator?
  end

  def submission_count?
    show?
  end

  def index_xlsx?
    survey_results?
  end

  def delete_inputs?
    active_moderator?
  end

  def active_moderator?
    ProjectPolicy.new(user, record.project).active_moderator?
  end
end
