# frozen_string_literal: true

class PosthogIntegration::TrackPosthogService
  def initialize(posthog_client = POSTHOG_CLIENT)
    @posthog = posthog_client
  end

  def identify_user(user)
    return unless @posthog && track_user?(user)

    # The information passed to identify best stays in sync with the same call
    # happening in the FE, currently happening in
    # front/app/modules/commercial/posthog/index.ts:49
    @posthog.identify({
      distinct_id: user.id,
      properties: {
        email: user.email,
        name: user.full_name,
        first_name: user.first_name,
        last_name: user.last_name,
        locale: user.locale,
        highest_role: user.highest_role.to_s,
        created_at: user.created_at,
        registration_completed_at: user.registration_completed_at
      }
    })
  end

  def identify_tenant(tenant)
    return unless @posthog

    @posthog.group_identify({
      group_type: 'tenant',
      group_key: tenant.id,
      properties: {
        name: tenant.name,
        host: tenant.host,
        lifecycle_stage: tenant.configuration.settings.dig('core', 'lifecycle_stage'),
        cluster: CL2_CLUSTER
      }
    })
  end

  def track_activity(activity)
    return unless @posthog
    return unless activity.user && track_user?(activity.user)

    tracking_service = TrackingService.new
    @posthog.capture({
      distinct_id: activity.user_id,
      event: tracking_service.activity_event_name(activity),
      timestamp: activity.acted_at,
      properties: {
        source: 'cl2-back',
        **tracking_service.activity_properties(activity)
      },
      groups: {
        tenant: AppConfiguration.instance.id
      }
    })
  end

  private

  def track_user?(user)
    !user.normal_user?
  end
end
