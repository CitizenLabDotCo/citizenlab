class IdentifyToSegmentJob < ApplicationJob
  queue_as :default

  def perform(user)
    tenant = nil

    begin
      tenant = Tenant.current
    rescue ActiveRecord::RecordNotFound => e
    end

    call_identify(user, tenant)
    call_group(user, tenant) if tenant
  end

  def call_identify user, tenant
    traits = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at,
      locale: user.locale,
      birthday: user.birthyear,
      gender: user.gender,
      is_super_admin: user.super_admin?,
      is_admin: user.admin?,
      is_project_moderator: user.project_moderator?,
      highest_role: user.highest_role,
    }
    if tenant
      LogToSegmentService.new.add_tenant_properties(traits, tenant)
      traits[:timezone] = tenant.settings.dig('core', 'timezone')
    end

    Analytics && Analytics.identify(
      user_id: user.id,
      traits: traits
    )
  end

  def call_group user, tenant
    traits = {
      name: tenant.name,
      website: "https://#{tenant.host}",
      avatar: tenant&.logo&.medium&.url,
      createdAt: tenant.created_at,
      tenantLocales: tenant.settings.dig('core', 'locales')
    }
    LogToSegmentService.new.add_tenant_properties(traits, tenant)

    Analytics && tenant && Analytics.group(
      user_id: user.id,
      group_id: tenant.id,
      traits: traits
    )
  end

end
