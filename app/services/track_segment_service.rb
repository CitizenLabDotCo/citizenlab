class TrackSegmentService

  class Configuration
    attr_accessor :user_traits_builder, :tenant_traits_builder, :activity_traits_builder

    def initialize
      @user_traits_builder = TrackSegmentService::Helpers.method(:default_user_traits)
      @activity_traits_builder = TrackSegmentService::Helpers.method(:default_activity_traits)
      @tenant_traits_builder = nil  # no default builder
    end
  end

  module Helpers
    def self.default_user_traits(user)
      {
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
        timezone: AppConfiguration.instance.settings('core', 'timezone'),
      }
    end

    def self.default_activity_traits(activity)
      {
        source: 'cl2-back',
        item_content: TrackingService.new.activity_item_content(activity),
      }
    end
  end

  def self.setup
    @configuration ||= Configuration.new
    yield @configuration if block_given?
  end

  def initialize(segment_client = SEGMENT_CLIENT)
    @tracking_service = TrackingService.new
    @segment_client = SEGMENT_CLIENT
  end

  def identify_user(user)
    return unless @segment_client
    traits = build_user_traits(user)
    @segment_client.identify(
      user_id: user.id,
      traits: traits,
      integrations: integrations(user)
    )
  end

  def identify_tenant(tenant=nil)
    return unless @segment_client
    tenant ||= Tenant.current
    traits = build_tenant_traits(tenant)
    integrations = { All: true, Intercom: true, SatisMeter: true }

    # Segment provides no way to track a group of users directly.
    # You have to piggyback the group traits/properties when associating a user to the group.
    # This is the reason why we use a dummy user.
    @segment_client.group(
      user_id: dummy_user_id,
      group_id: tenant.id,
      traits: traits,
      integrations: integrations
    )
  end

  def track_activity(activity)
    return unless @segment_client
    event = event_from_activity(activity)
    @segment_client.track(event)
  end

  def integrations(user)
    {
      All: true,
      Intercom: [:admin, :project_moderator].include?(user.highest_role),
      SatisMeter: [:admin, :project_moderator].include?(user.highest_role),
    }
  end

  private
  
  def build_user_traits(user)
    return {} unless TrackSegmentService.user_traits_builder
    TrackSegmentService.user_traits_builder.call(user)
  end

  def build_tenant_traits(tenant)
    return {} unless TrackSegmentService.tenant_traits_builder
    TrackSegmentService.tenant_traits_builder.call(tenant)
  end
  
  def build_activity_traits(activity)
    return {} unless TrackSegmentService.activity_traits_builder
    TrackSegmentService.activity_traits_builder.call(activity)
  end

  def event_from_activity(activity)
    event = {
      event: @tracking_service.activity_event_name(activity),
      timestamp: activity.acted_at,
      properties: build_activity_traits(activity)
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

  setup
end
