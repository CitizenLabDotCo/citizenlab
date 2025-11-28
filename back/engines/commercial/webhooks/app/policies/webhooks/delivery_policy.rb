# frozen_string_literal: true

module Webhooks
  class DeliveryPolicy < ::ApplicationPolicy
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

    def replay?
      active_admin?
    end
  end
end
