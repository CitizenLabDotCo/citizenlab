module EmailCampaigns
  class UserWeeklyDigestJob < ApplicationJob
    queue_as :default
  
    N_IDEAS = ENV.fetch("N_USER_WEEKLY_DIGEST_IDEAS", 3)
  
    def perform
      ti_service = TrendingIdeaService.new # always at thy service
      if ti_service.filter_trending(IdeaPolicy::Scope.new(nil, Idea).scope).count < N_IDEAS
        # don't send any emails if there are fewer than N_IDEAS truly trending ideas
        return
      end
      User.all.each do |user|
        # IdentifyToSegmentJob.perform_now(user)
        
        # No need to filter by tuly trending; the top
        # ideas are always the truly trending ones and
        # we made sure there are more than N_IDEAS 
        # truly trending publicly visible ideas.
        top_ideas = ti_service.sort_trending(ti_service.filter_trending(IdeaPolicy::Scope.new(user, Idea).scope).left_outer_joins(:idea_status)).take N_IDEAS
  
        serializer = "EmailCampaigns::UserWeeklyDigestIdeaSerializer".constantize
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
end
