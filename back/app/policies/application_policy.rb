class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    false
  end

  def show?
    scope.where(:id => record.id).exists?
  end

  def create?
    false
  end

  def update?
    false
  end

  def destroy?
    false
  end

  def scope
    Pundit.policy_scope!(user, record.class)
  end

  def raise_not_authorized(reason)
    raise Pundit::NotAuthorizedError, reason: reason
  end

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      scope
    end
  end
  
  private

  def admin?
    user&.admin?
  end

  def owner?
    user && record.user_id == user.id
  end

  def active?
    user&.active?
  end
end
