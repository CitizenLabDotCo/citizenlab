class TrackSegmentService

  def identify_user(user, tenant)
    traits = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at,
      locale: user.locale,
      birthday: user.birthyear,
      gender: user.gender,
      isSuperAdmin: user.super_admin?,
      isAdmin: user.admin?,
      isProjectModerator: user.project_moderator?,
      highestRole: user.highest_role,
    }
    if tenant
      TrackingService.new.add_tenant_properties(traits, tenant)
      traits[:timezone] = tenant.settings.dig('core', 'timezone')
    end

    Analytics && Analytics.identify(
      user_id: user.id,
      traits: traits,
      integrations: integrations(user)
    )
  end

  def identify_tenant user, tenant
    traits = {
      name: tenant.name,
      website: "https://#{tenant.host}",
      avatar: tenant&.logo&.medium&.url,
      createdAt: tenant.created_at,
      tenantLocales: tenant.settings.dig('core', 'locales')
    }
    TrackingService.new.add_tenant_properties(traits, tenant)

    Analytics && tenant && Analytics.group(
      user_id: user.id,
      group_id: tenant.id,
      traits: traits,
      integrations: integrations(user)
    )
  end

  def track activity
    event = {
      event: TrackingService.new.activity_event_name(activity),
      timestamp: activity.acted_at,
      properties: {
        source: 'cl2-back'
      }
    }

    if activity.user_id
      event[:user_id] = activity.user_id
      if activity.user
        event[:integrations] = integrations(activity.user)
      end
    else
    	event[:anonymous_id] = SecureRandom.base64
    end
    TrackingService.new.add_activity_properties event[:properties], activity
    begin
      tenant = Tenant.current
      TrackingService.new.add_tenant_properties event[:properties], tenant
    rescue  ActiveRecord::RecordNotFound => e
      # Tenant can't be found, so we don't add anything
    end
    TrackingService.new.add_activity_item_content event, event[:properties], activity
    TrackingService.new.add_environment_properties event[:properties]
    Analytics.track event
  end

  def integrations user
    {
      All: true,
      Intercom: [:admin, :project_moderator].include?(user.highest_role),
      SatisMeter: [:admin, :project_moderator].include?(user.highest_role),
    }
  end
end
