class SideFxTenantService

  include SideFxHelper

  def before_create tenant, current_user
  end

  def after_create tenant, current_user
    LogActivityJob.perform_later(tenant, 'created', current_user, tenant.created_at.to_i)
  end

  def after_apply_template tenant, current_user
    Apartment::Tenant.switch(tenant.schema_name) do
      # fix campaigns
      EmailCampaigns::AssureCampaignsService.new.assure_campaigns
      # fix permissions
      PermissionsService.new.update_permissions_for_current_tenant
      # fix text images
      txt_img_srv = TextImageService.new
      Project.all.each do |project|
        project.update! description_multiloc: txt_img_srv.swap_data_images(project, :description_multiloc)
      end
      Page.all.each do |page|
        page.update! body_multiloc: txt_img_srv.swap_data_images(page, :body_multiloc)
      end
      Phase.all.each do |phase|
        phase.update! description_multiloc: txt_img_srv.swap_data_images(phase, :description_multiloc)
      end
      update_group_by_identify
    end
    LogActivityJob.perform_later(tenant, 'initialized', current_user, tenant.created_at.to_i)
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
    Apartment::Tenant.switch(tenant.schema_name) do
      update_group_by_identify
    end
  end

  def before_destroy tenant, current_user
    Apartment::Tenant.switch(tenant.schema_name) do
      Surveys::TypeformWebhookManager.new.tenant_to_be_destroyed(tenant)
    end
  end

  def after_destroy frozen_tenant, current_user
    serialized_tenant = clean_time_attributes(frozen_tenant.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_tenant), 'deleted', current_user, Time.now.to_i, payload: {tenant: serialized_tenant})
  end


  private

  def update_group_by_identify
    user = User.admin.first
    user ||= User.first
    IdentifyToSegmentJob.perform_later(user) if user
  end



end