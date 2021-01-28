module MultiTenancy::ApplicationControllerDecorator

  def self.prepended(base)
    base.class_eval do
      before_action :set_current_tenant
      rescue_from Apartment::TenantNotFound, with: :tenant_not_found
    end
  end

  def set_current_tenant
    Current.tenant = Tenant.current
  rescue ActiveRecord::RecordNotFound
  end

  def tenant_not_found
    head 404
  end

end

ApplicationController.prepend(MultiTenancy::ApplicationControllerDecorator)
