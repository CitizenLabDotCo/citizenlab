module EmailCampaigns
  class UserPlatformDigestJob < ApplicationJob
    queue_as :default
  
    N_TOP_IDEAS = ENV.fetch("N_USER_PLATFORM_DIGEST_IDEAS", 3).to_i
    N_DISCOVER_PROJECTS = ENV.fetch("N_DISCOVER_PROJECTS", 3).to_i

  
    def perform
      ti_service = TrendingIdeaService.new # always at thy service
      if ti_service.filter_trending(IdeaPolicy::Scope.new(nil, Idea).resolve.where(publication_status: 'published')).count < N_TOP_IDEAS
        # don't send any emails if there are fewer than N_TOP_IDEAS truly trending ideas
        return
      end
      User.all.each do |user|

        top_ideas = ti_service.sort_trending(ti_service.filter_trending(IdeaPolicy::Scope.new(user, Idea).resolve.where(publication_status: 'published')).left_outer_joins(:idea_status)).take N_TOP_IDEAS
        serializer = "EmailCampaigns::UserPlatformDigestIdeaSerializer".constantize
        serialized_top_ideas = top_ideas.map do |idea|
          ActiveModelSerializers::SerializableResource.new(idea, {
            serializer: serializer,
            adapter: :json
          }).serializable_hash
        end

        discover_projects = ProjectPolicy::Scope.new(user, Project).resolve.sort_by(&:created_at).reverse.take N_DISCOVER_PROJECTS
        serializer = "EmailCampaigns::DiscoverProjectSerializer".constantize
        serialized_discover_projects = discover_projects.map do |project|
          ActiveModelSerializers::SerializableResource.new(project, {
            serializer: serializer,
            adapter: :json
          }).serializable_hash
        end
  
        tenant = Tenant.current
        trackingMessage = {
          event: "Periodic email for user platform digest",
          user_id: user.id,
          timestamp: Time.now,
          properties: {
            source: 'cl2-back',
            payload: {
              top_ideas: serialized_top_ideas,
              discover_projects: serialized_discover_projects
            },
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
