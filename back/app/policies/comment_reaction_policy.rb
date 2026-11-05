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
    # Disliking comments is not a supported feature
    return false unless record.up?

    reacting_permitted?
  end

  def show?
    active? && (owner? || admin?)
  end

  def destroy?
    reacting_permitted?
  end

  private

  def reacting_permitted?
    return false if !active? || !owner? || !policy_for(record.reactable.idea.project).show?

    reason = Permissions::IdeaPermissionsService.new(record.reactable.idea, user).denied_reason_for_action 'commenting_idea'
    reason ? raise_not_authorized(reason) : true
  end
end
