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
    participation_method = record.participation_method

    return policy_for(record.project).show? unless participation_method == 'native_survey' && (user.nil? || user.normal_user?)

    reason = Permissions::ProjectPermissionsService.new(
      record.project,
      user
    ).denied_reason_for_action 'posting_idea'

    raise_not_authorized(reason) if reason

    true
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

  def sentiment_by_quarter?
    active_moderator?
  end

  def submission_count?
    policy_for(record.project).show?
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

  def active_moderator?
    policy_for(record.project).active_moderator?
  end
end
