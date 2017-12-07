class SideFxTenantService

  include SideFxHelper

  def before_create tenant, current_user
  end

  def after_create tenant, current_user
    LogActivityJob.perform_later(tenant, 'created', current_user, tenant.created_at.to_i)
  end

  def before_update tenant, current_user
  end

  def after_update tenant, current_user
    LogActivityJob.perform_later(tenant, 'changed', current_user, tenant.updated_at.to_i)
    
    if tenant.host_previously_changed?
      LogActivityJob.perform_later(tenant, 'changed_host', current_user, tenant.updated_at.to_i)
    end

  end

end