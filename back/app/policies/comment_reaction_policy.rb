# frozen_string_literal: true

class CommentReactionPolicy < ApplicationPolicy
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
    return false unless active? && owner?

    reason = Permissions::IdeaPermissionsService.new(record.reactable.idea, user).denied_reason_for_action 'commenting_idea'
    reason ? raise_not_authorized(reason) : true
  end

  def show?
    active? && (owner? || admin?)
  end

  def up?
    create?
  end

  def down?
    false
  end

  def destroy?
    create?
  end
end
