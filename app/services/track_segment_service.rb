class TrackSegmentService

  def initialize
    @tracking_service = TrackingService.new
  end

  def identify_user(user)
    return unless Analytics
    tenant = Tenant.current

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
      **@tracking_service.tenant_properties(tenant)
    }
    if tenant
      traits[:timezone] = tenant.settings.dig('core', 'timezone')
    end

    Analytics.identify(
      user_id: user.id,
      traits: traits,
      integrations: integrations(user)
    )
  end

  def identify_tenant(tenant)
    return unless Analytics
    traits = {
        name: tenant.name,
        website: "https://#{tenant.host}",
        avatar: tenant&.logo&.medium&.url,
        createdAt: tenant.created_at,
        tenantLocales: tenant.settings.dig('core', 'locales'),
        **@tracking_service.tenant_properties(tenant)
    }

    integrations = { All: true, Intercom: true, SatisMeter: true }

    # Segment provides no way to track a group of users directly.
    # You have to piggyback the group traits/properties when associating a user to the group.
    # This is the reason why we use a dummy user.
    Analytics && tenant && Analytics.group(
        user_id: dummy_user_id,
        group_id: tenant.id,
        traits: traits,
        integrations: integrations
    )
  end

  def track_activity(activity)
    event = event_from_activity(activity)
    track(event)
  end

  def track(event)
    event[:properties].merge!(@tracking_service.tenant_properties(Tenant.current)) if Tenant.current
    Analytics.track(event)
  end

  def integrations(user)
    {
        All: true,
        Intercom: [:admin, :project_moderator].include?(user.highest_role),
        SatisMeter: [:admin, :project_moderator].include?(user.highest_role),
    }
  end

  private

  def event_from_activity(activity)
    event = {
        event: @tracking_service.activity_event_name(activity),
        timestamp: activity.acted_at,
        properties: {
            source: 'cl2-back',
            **@tracking_service.activity_properties(activity),
            **@tracking_service.environment_properties,
            item_content: @tracking_service.activity_item_content(activity)
        }
    }

    if activity.user_id
      event[:user_id] = activity.user_id
      event[:integrations] = integrations(activity.user) if activity.user
    else
      event[:anonymous_id] = anonymous_id
    end

    event
  end

  def dummy_user_id
    any_user = (User.admin.first || User.first)
    any_user&.id || anonymous_id
  end

  def anonymous_id
    SecureRandom.base64
  end

end
