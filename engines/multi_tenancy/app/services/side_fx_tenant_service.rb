# frozen_string_literal: true

class SideFxTenantService

  include SideFxHelper

  def before_create tenant, current_user; end

  def after_create tenant, current_user
    LogActivityJob.perform_later(tenant, 'created', current_user, tenant.created_at.to_i)
  end

  def after_apply_template tenant, current_user
    Apartment::Tenant.switch(tenant.schema_name) do
      # fix campaigns
      EmailCampaigns::AssureCampaignsService.new.assure_campaigns
      # fix permissions
      PermissionsService.new.update_all_permissions
      track_tenant_async(tenant)
    end
  ensure
    LogActivityJob.perform_later(tenant, 'template_loaded', current_user, tenant.created_at.to_i)
  end

  def before_update tenant, current_user; end

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
    Apartment::Tenant.switch(tenant.schema_name) do
      track_tenant_async(tenant)
    end
  end

  def before_destroy tenant, current_user
    Apartment::Tenant.switch(tenant.schema_name) do
      Surveys::TypeformWebhookManager.new.delete_all_webhooks
    end
  end

  def after_destroy frozen_tenant, current_user
    serialized_tenant = clean_time_attributes(frozen_tenant.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_tenant), 'deleted', current_user, Time.now.to_i, payload: {tenant: serialized_tenant})
  end


  private

  # @param [Tenant] tenant
  def track_tenant_async(tenant)
    MultiTenancy::TrackTenantJob.perform_later(tenant)
  end

end
