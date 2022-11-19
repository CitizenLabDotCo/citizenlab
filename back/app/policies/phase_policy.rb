# frozen_string_literal: true

class PhasePolicy < ApplicationPolicy
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

  def survey_results?
    ProjectPolicy.new(user, record.project).survey_results?
  end

  def submission_count?
    survey_results?
  end

  def index_xlsx?
    survey_results?
  end

  def delete_inputs?
    return false unless active?

    UserRoleService.new.can_moderate_project? record.project, user
  end
end
