class InitiativeCommentPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(post_type: 'Initiative')
    end
  end

  def index_xlsx?
    user&.admin?
  end

  def create?
    (
      user&.active? && 
      (record.author_id == user.id) &&
      check_commenting_allowed(record, user)
    ) || 
    (user&.active? && user.admin?)
  end

  def children?
    show?
  end

  def show?
    InitiativePolicy.new(user, record.post).show?
  end

  def update?
    create?
  end

  def mark_as_deleted?
    update?
  end

  def destroy?
    false
  end

  def permitted_attributes_for_update
    attrs = [:parent_id, :author_id]
    if record.author_id == user&.id
      attrs += [body_multiloc: CL2_SUPPORTED_LOCALES]
    end
    attrs
  end


  private

  def check_commenting_allowed comment, user
    !PermissionsService.new.commenting_initiative_disabled_reason user
  end

end
