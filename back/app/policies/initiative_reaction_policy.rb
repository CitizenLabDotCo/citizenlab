# frozen_string_literal: true

class InitiativeReactionPolicy < ApplicationPolicy
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

  def create?
    return if !user&.active? || !owner?

    reason = reacting_denied_reason user
    reason ? raise_not_authorized(reason) : true
  end

  def destroy?
    create?
  end

  def up?
    create?
  end

  def down?
    # TODO: JS - should this reason be in a permissions service
    raise_not_authorized('dislikes_not_supported')
  end

  def show?
    active? && (owner? || admin?)
  end

  private

  def reacting_denied_reason(user)
    Permissions::InitiativePermissionsService.new(user).denied_reason_for_action 'reacting_initiative'
  end
end
