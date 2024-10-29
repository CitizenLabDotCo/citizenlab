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
    return unless active? && owner?

    reason = case record.reactable&.post_type
    when 'Idea'
      Permissions::IdeaPermissionsService.new(record.reactable.post, user).denied_reason_for_action 'commenting_idea'
    when 'Initiative'
      Permissions::InitiativePermissionsService.new(user).denied_reason_for_action 'commenting_initiative'
    else
      raise ArgumentError, "Comment reacting policy not implemented for #{record.reactable&.post_type}"
    end

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
