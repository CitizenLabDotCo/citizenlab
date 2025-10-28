# frozen_string_literal: true

module Webhooks
  class SubscriptionPolicy < ::ApplicationPolicy
    class Scope < ::ApplicationPolicy::Scope
      def resolve
        # Tenant-scoped via Apartment, only admins can access
        if admin? && active?
          scope.all
        else
          scope.none
        end
      end
    end

    def index?
      active_admin?
    end

    def show?
      active_admin?
    end

    def create?
      active_admin?
    end

    def update?
      active_admin?
    end

    def destroy?
      active_admin?
    end

    def test?
      active_admin?
    end

    def regenerate_secret?
      active_admin?
    end
  end
end
