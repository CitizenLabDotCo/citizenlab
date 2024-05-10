# frozen_string_literal: true

class CommentReactionPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

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
      Permissions::PermissionsService.new.denied_reason_for_idea record.reactable.post, user, 'commenting_idea'
    when 'Initiative'
      denied_for_initiative_reason user
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

  private

  # TODO: JS - not consistent with how ideas are done above
  def denied_for_initiative_reason(user)
    Permissions::PermissionsService.new.denied_reason_for_resource user, 'commenting_initiative'
  end
end
