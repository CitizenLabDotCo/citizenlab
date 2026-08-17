# frozen_string_literal: true

class IdeaReactionPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin?
        scope.all
      elsif user
        scope.where(user: user)
      else
        scope.none
      end
    end
  end

  def show?
    active? && (owner? || admin?)
  end

  def create?
    return false unless could_modify?

    reason = permissions_service.denied_reason_for_reaction_mode record.mode
    reason ? raise_not_authorized(reason) : true
  end

  def destroy?
    return false unless could_modify?

    reason = permissions_service.denied_reason_for_reaction_mode(record.mode, delete_action: true)
    reason ? raise_not_authorized(reason) : true
  end

  private

  def could_modify?
    active? && owner? && record.reactable.present? && policy_for(record.reactable.project).show?
  end

  def permissions_service
    @permissions_service ||= Permissions::IdeaPermissionsService.new(record.reactable, user)
  end
end
