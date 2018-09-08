class SideFxTenantService

  include SideFxHelper

  def before_create tenant, current_user
  end

  def after_create tenant, current_user
    Apartment::Tenant.switch(tenant.schema_name) do
      EmailCampaigns::AssureCampaignsService.new.assure_campaigns
    end
    LogActivityJob.perform_later(tenant, 'created', current_user, tenant.created_at.to_i)
  end

  def before_update tenant, current_user
  end

  def after_update tenant, current_user
    LogActivityJob.perform_later(tenant, 'changed', current_user, tenant.updated_at.to_i)
    
    if tenant.host_previously_changed?
      LogActivityJob.perform_later(tenant, 'changed_host', current_user, tenant.updated_at.to_i, payload: {changes: tenant.host_previous_change})
    end

    if tenant.settings_previously_changed?
      old_settings = tenant.settings_previous_change[0]
      new_settings = tenant.settings

      lifecycle_change_diff = [old_settings, new_settings].map{|s| s&.dig('core', 'lifecycle_stage')}
      if lifecycle_change_diff.uniq.size > 1
        LogActivityJob.perform_later(tenant, 'changed_lifecycle_stage', current_user, tenant.updated_at.to_i, payload: {changes: lifecycle_change_diff})
      end
    end
  end

  def after_destroy frozen_tenant, current_user
    serialized_tenant = clean_time_attributes(frozen_tenant.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_tenant), 'deleted', current_user, Time.now.to_i, payload: {tenant: serialized_tenant})
  end



end