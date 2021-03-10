class InitiativeVotePolicy < ApplicationPolicy

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
    return unless user&.active? && owner?

    reason = PermissionsService.new.denied?(user, 'voting_initiative')
    reason ? raise_not_authorized(reason) : true
  end

  def destroy?
    create?
  end

  def up?
    create?
  end

  def down?
    raise_not_authorized('downvoting_not_supported')
  end

  def show?
    user&.active? && (owner? || user.admin?)
  end

  private

  def owner?
    record.user_id == user.id
  end
end
