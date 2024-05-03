# frozen_string_literal: true

class BackgroundJobPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.all_by_tenant_schema_name(Tenant.current.schema_name)
    end
  end

  def index?
    active_admin_or_moderator?
  end
end
