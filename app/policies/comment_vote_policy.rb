class CommentVotePolicy < ApplicationPolicy

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
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
    if user&.active? && (record.user_id == user.id) 
      case record.votable&.post_type
      when Idea.name
        !ParticipationContextService.new.voting_disabled_reason_for_idea_comment record.votable, user
      when Initiative.name
        !PermissionsService.new.voting_disabled_reason_for_initiative_comment user
      else
        false
      end
    else 
      false
    end
  end

  def show?
    (user&.active? && (record.user_id == user.id || user.admin?))
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
