class SideFxTenantService

  include SideFxHelper

  def before_create tenant, current_user
  end

  def after_create tenant, current_user
    LogActivityJob.perform_later(tenant, 'created', current_user, tenant.created_at.to_i)
    GroupToSegmentJob.perform_later(tenant)
  end

  def before_update tenant, current_user
  end

  def after_update tenant, current_user
    LogActivityJob.perform_later(tenant, 'changed', current_user, tenant.updated_at.to_i)
    
    if tenant.host_previously_changed?
      LogActivityJob.perform_later(tenant, 'changed_host', current_user, tenant.updated_at.to_i, payload: {changes: tenant.host_previous_change})
    end

    GroupToSegmentJob.perform_later(tenant)
  end

  def after_destroy frozen_tenant, current_user
    serialized_tenant = clean_time_attributes(frozen_tenant.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_tenant), 'deleted', current_user, Time.now.to_i, payload: {tenant: serialized_tenant})
  end



end