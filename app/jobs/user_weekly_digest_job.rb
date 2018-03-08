class UserWeeklyDigestJob < ApplicationJob
  queue_as :default

  N_IDEAS = 5

  def perform
    User.all.each do |user|
      top_ideas = TrendingIdeaService.new.sort_trending(IdeaPolicy::Scope.new(user, Idea).scope).take N_IDEAS

      serializer = "WebApi::V1::External::IdeaSerializer".constantize
      serialized_top_ideas = top_ideas.map do |idea|
        ActiveModelSerializers::SerializableResource.new(idea, {
          serializer: serializer,
          adapter: :json
        }).serializable_hash
      end

      tenant = Tenant.current
      trackingMessage = {
        event: "Periodic email for user weekly digest",
        user_id: user.id,
        timestamp: Time.now,
        properties: {
          source: 'cl2-back',
          payload: serialized_top_ideas,
          tenantId: tenant.id,
          tenantName: tenant.name,
          tenantHost: tenant.host,
          tenantOrganizationType: tenant.settings.dig('core', 'organization_type')
        }
      }

      Analytics.track(trackingMessage)
    end
  end

end
