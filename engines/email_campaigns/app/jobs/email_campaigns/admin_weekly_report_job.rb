module EmailCampaigns
  class AdminWeeklyReportJob < ApplicationJob
    queue_as :default

    N_TOP_IDEAS = ENV.fetch("N_ADMIN_WEEKLY_REPORT_IDEAS", 12)
    N_DAYS_SINCE = ENV.fetch("N_DAYS_SINCE_ADMIN_WEEKLY_REPORT", 7)

  
    def perform
      User.all.select{|user| user.admin?}.each do |admin|
      	since = Time.now - N_DAYS_SINCE.days

      	top_ideas = Idea.where(publication_status: 'published').all
      	top_ideas = top_ideas.select{|idea| idea_recently_changed(idea, since=since)}
      	top_ideas = top_ideas.sort_by(&:published_at).reverse.take N_TOP_IDEAS # TODO sort by activity_count

      	top_project_ideas = {}
        top_ideas.each do |idea|
        	top_project_ideas[idea.project_id] ||= []
        	top_project_ideas[idea.project_id] += [idea]
        end

        # normally, the projects will be ordered by recentness of their most recent idea
        serialized_top_project_ideas = top_project_ideas.map do |project_id, ideas|
        	project_serializer = "EmailCampaigns::DiscoverProjectSerializer".constantize
        	serialized_project = ActiveModelSerializers::SerializableResource.new(Project.find(project_id), {
            serializer: project_serializer,
            adapter: :json
           }).serializable_hash

        	{
        		project: serialized_project,
        		top_ideas: ideas.map{ |idea|
              to_weekly_report_idea_hash(idea, since=since)
        		} 
        	}
        end
  
        tenant = Tenant.current
        trackingMessage = {
          event: "Periodic email for admin weekly report",
          user_id: admin.id,
          timestamp: Time.now,
          properties: {
            source: 'cl2-back',
            payload: {
            	statistics: {
            		activities: {
                  new_ideas: increase_hash(Idea.all.map(&:published_at).compact),
                  new_comments: increase_hash(Comment.all.map(&:created_at).compact),
                  new_votes: increase_hash(Vote.all.map(&:created_at).compact)
            		},
            		users: {
                  new_visitors: increase_hash([]),
                  new_users: increase_hash(User.all.map(&:registration_completed_at).compact),
                  active_users: increase_hash([])
            		} 
            	},
              top_project_ideas: serialized_top_project_ideas
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

    def idea_recently_changed idea, since=last_week
    	(idea.updated_at > since) || 
    	(!idea_recent_votes(idea, since=since).empty?) ||
    	(!idea_recent_comments(idea, since=since).empty?)
    end

    def idea_recent_votes idea, since=last_week
    	idea.votes.select{|v| v.created_at > since}
    end

    def idea_recent_comments idea, since=last_week
    	idea.comments.select{|c| c.created_at > since}
    end

    def last_week
    	Time.now - 1.weeks
    end

    def to_weekly_report_idea_hash idea, since=last_week
    	{
    		id: idea.id,
    		title_multiloc: idea.title_multiloc,
    		url: FrontendService.new.model_to_url(idea),
    		published_at: idea.published_at,
    		author_name: idea.author_name,
    		upvotes_count: idea.upvotes_count,
    		upvotes_increment: idea_recent_votes(idea, since=since).select{|v| v.mode == 'up'}.count,
    		downvotes_count: idea.downvotes_count,
    		downvotes_increment: idea_recent_votes(idea, since=since).select{|v| v.mode == 'down'}.count,
    		comments_count: idea.comments_count,
    		comments_increment: idea_recent_comments(idea, since=since).count
    	}
    end

    def increase_hash timestamps
    	last_2n_ago = timestamps.select{|ts| ts > (Time.now - (N_DAYS_SINCE * 2).days)}
    	last_n_ago = last_2n_ago.select{|ts| ts > (Time.now - N_DAYS_SINCE.days)}
    	{
    		increase: last_n_ago.size,
    		past_increase: (last_2n_ago.size - last_n_ago.size)
    	}
    end
  end
end
