class CommentVotePolicy < ApplicationPolicy

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
    return unless user&.active? && (record.user_id == user.id)

    reason = case record.votable&.post_type
             when 'Idea'
               ParticipationContextService.new.voting_disabled_reason_for_idea_comment(record.votable, user)
             when 'Initiative'
               PermissionsService.new.denied?(user, 'commenting_initiative')
             else
               raise Pundit::NotAuthorizedError
             end

    reason ? raise_not_authorized(reason) : true
  end

  def show?
    user&.active? && (record.user_id == user.id || user.admin?)
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
