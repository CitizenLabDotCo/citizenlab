# frozen_string_literal: true

class ApplicationPolicy
  module Helpers
    def raise_not_authorized(reason)
      raise Pundit::NotAuthorizedErrorWithReason,
        reason: reason,
        message: "not allowed to perform this action because: #{reason}"
    end

    private

    def policy_for(record)
      Pundit.policy!(user_context, record)
    end

    def scope_for(target_scope_or_klass)
      Pundit.policy_scope!(user_context, target_scope_or_klass)
    end

    def can_moderate?
      user && UserRoleService.new.can_moderate?(record, user)
    end

    def admin?
      user&.admin?
    end

    def active_admin_or_moderator?
      active? && (admin? || user&.project_or_folder_moderator?)
    end

    def owner?
      user && record.user_id == user.id
    end

    def active?
      user&.active?
    end

    def active_admin?
      admin? && active?
    end
  end

  class UserContext
    attr_reader :user, :context

    def initialize(user, context = {})
      @user = user
      @context = context
    end
  end

  class Scope
    include Helpers

    attr_reader :scope, :user_context

    delegate :user, :context, to: :user_context

    def initialize(user_context, scope)
      @scope = scope
      @user_context = user_context.is_a?(UserContext) ? user_context : UserContext.new(user_context)
    end

    def resolve
      scope
    end
  end

  include Helpers

  attr_reader :record, :user_context

  delegate :context, :user, to: :user_context

  # @param [UserContext,User,nil] user_context
  def initialize(user_context, record)
    @record = record
    @user_context = user_context.is_a?(UserContext) ? user_context : UserContext.new(user_context)
  end

  def index?
    false
  end

  def show?
    scope.exists?(id: record.id)
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
    Pundit.policy_scope!(user_context, record.class)
  end
end
