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

  def common_ground_results?
    policy_for(record.project).show?
  end

  def sentiment_by_quarter?
    active_moderator?
  end

  def submission_count?
    show?
  end

  def index_xlsx?
    survey_results?
  end

  def show_mini?
    show?
  end

  def delete_inputs?
    active_moderator?
  end

  def copy_inputs_to_phase?
    # Moderators are also allowed to copy ideas to phases they moderate. However, they
    # can only import inputs they have access to. This approach is a bit simplistic.
    # Ideally, moderators should only be able to copy inputs from projects they manage.
    active_moderator?
  end

  def active_moderator?
    policy_for(record.project).active_moderator?
  end

  def show_progress?
    return false unless active?

    policy_for(record.project).show?
  end
end
