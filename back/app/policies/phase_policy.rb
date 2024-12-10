# frozen_string_literal: true

class PhasePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(project: scope_for(Project))
    end
  end

  def create?
    policy_for(record.project).update?
  end

  def show?
    policy_for(record.project).show?
  end

  def update?
    policy_for(record.project).update?
  end

  def destroy?
    policy_for(record.project).update?
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

  def index_mini?
    true
  end

  def delete_inputs?
    active_moderator?
  end

  def active_moderator?
    policy_for(record.project).active_moderator?
  end
end
