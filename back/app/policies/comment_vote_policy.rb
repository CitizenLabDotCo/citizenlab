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
    return unless active? && owner?

    reason = case record.votable&.post_type
             when 'Idea'
               ParticipationContextService.new.voting_disabled_reason_for_idea_comment(record.votable, user)
             when 'Initiative'
               denied_for_initiative_reason user
             else
               raise ArgumentError, "Comment voting policy not implemented for #{record.votable&.post_type}"
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

  def denied_for_initiative_reason user
    :not_signed_in if !user
  end
end

CommentVotePolicy.prepend_if_ee('GranularPermissions::Patches::CommentVotePolicy')
