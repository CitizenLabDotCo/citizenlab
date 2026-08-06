# frozen_string_literal: true

class SpamReportPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin?
        scope
      elsif user
        scope.where(user: user)
      else
        scope.none
      end
    end
  end

  def create?
    return false unless active?
    return false unless record.user_id == user.id || user.admin?
    # The reportable is looked up from the URL, so it may not exist. Bail out
    # before Pundit is asked for a policy on nil.
    return false if record.spam_reportable.blank?

    policy_for(record.spam_reportable).show?
  end

  def show?
    active? && (record.user_id == user.id || user&.admin?)
  end

  def update?
    active? && (record.user_id == user.id || user&.admin?)
  end

  def destroy?
    update?
  end
end
