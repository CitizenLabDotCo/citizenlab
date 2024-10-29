# frozen_string_literal: true

class BackgroundJobPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all_by_tenant_schema_name(Tenant.current.schema_name)
    end
  end

  def index?
    active_admin_or_moderator?
  end
end
