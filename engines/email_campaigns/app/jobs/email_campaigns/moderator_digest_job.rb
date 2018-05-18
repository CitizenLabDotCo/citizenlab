module EmailCampaigns
  class ModeratorDigestJob < ApplicationJob
    queue_as :default

    CAMPAIGN = 'moderator_digest'
    N_TOP_IDEAS = ENV.fetch("N_MODERATOR_DIGEST_IDEAS", 12).to_i

  
    def perform last_scheduled_at=(Time.now - 7.days).to_i
      last_scheduled_at = Time.at(last_scheduled_at)
      Project.all.each do |project|
      	User.project_moderators(project.id).select{|user| !user.admin?}.each do |moderator|
	        days_interval = ((Time.now - last_scheduled_at) / 1.day).days

	        statistics = moderator_digest_statistics project, days_interval
	        top_ideas = moderator_digest_top_ideas project, days_interval
	        has_new_ideas = (top_ideas.size > 0)

	        if top_ideas.empty?
	          return
	        end

	        project_serializer = "EmailCampaigns::DiscoverProjectSerializer".constantize
	        serialized_project = ActiveModelSerializers::SerializableResource.new(project, {
	          serializer: project_serializer,
	          adapter: :json
	         }).serializable_hash
	  
	        tenant = Tenant.current
	        trackingMessage = {
	          event: "Periodic email for #{CAMPAIGN.gsub '_', ' '}",
	          user_id: moderator.id,
	          timestamp: Time.now,
	          properties: {
	            source: 'cl2-back',
	            payload: {
	            	statistics: statistics,
	              has_new_ideas: has_new_ideas,
	              project: serialized_project,
                top_ideas: top_ideas
	            },
	            tenantId: tenant.id,
	            tenantName: tenant.name,
	            tenantHost: tenant.host,
	            tenantOrganizationType: tenant.settings.dig('core', 'organization_type')
	            ## TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO ##
	            #                                                                         #
	            # I think it would be useful to include the lifecycle_stage here now too. #
	            # I'm strongly considering a LogActivityService and PeriodicEventService  #
	            # where the tenant part and such of the event is generated through helper #
	            # functions.                                                              #
	            #                                                                         #
	            ## TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO ##
	          }
	        }
	        
	        Analytics.track(trackingMessage)

	        create_campaign_email_commands moderator, top_ideas
	      end
      end
    end

    def moderator_digest_top_ideas project, days_interval
      since = Time.now - days_interval

      top_ideas = Idea.where(publication_status: 'published').all
      top_ideas = top_ideas.select{|idea| (activity_count(idea, since=since) > 0) || (idea.published_at > since)}
      top_ideas = top_ideas.sort_by{|idea| activity_score(idea, since=since)}.reverse.take N_TOP_IDEAS
      top_ideas = top_ideas.sort_by{|idea| activity_count(idea, since=since)}.reverse

      top_ideas.map{ |idea|
        to_weekly_report_idea_hash(idea, since=since)
      }
    end

    def moderator_digest_statistics project, days_interval
      {
        activities: {
          new_ideas: increase_hash(project.ideas.map(&:published_at).compact, days_interval),
          new_comments: increase_hash([], days_interval), # TODO
          new_votes: increase_hash([], days_interval), # TODO
          total_ideas: project.ideas.count,
          total_users: 0 # TODO
        },
        users: {
          new_visitors: increase_hash([], days_interval), # TODO
          new_participants: increase_hash([], days_interval), # TODO
          active_users: increase_hash([], days_interval) # TODO
        } 
      }
    end

    def create_campaign_email_commands user, top_ideas
      # Also store projects?
      idea_ids = top_ideas.map{|idea_h| idea_h[:id]}
      idea_ids.uniq!
      EmailCampaigns::CampaignEmailCommand.create! campaign: CAMPAIGN, recipient: user, tracked_content: {'idea_ids': idea_ids}
    end



    def activity_score idea, since ### COPY PASTED from admin_weekly_report_job ###
      recent_activity = 1 + activity_count(idea, since=since)
      if idea.published_at
        (recent_activity**2) / (Time.now.to_i - idea.published_at.to_i)
      else
        0.0
      end
    end

    def activity_count idea, since ### COPY PASTED from admin_weekly_report_job ###
      idea_recent_votes(idea, since=since).select{|v| v.mode == 'up'}.select{|v| v.user_id != idea.author_id}.size + idea_recent_comments(idea, since=since).size
    end

    def idea_recent_votes idea, since ### COPY PASTED from admin_weekly_report_job ###
    	idea.votes.select{|v| v.created_at > since}
    end

    def idea_recent_comments idea, since ### COPY PASTED from admin_weekly_report_job ###
    	idea.comments.select{|c| c.created_at > since}
    end

    def to_weekly_report_idea_hash idea, since ### COPY PASTED from admin_weekly_report_job ###
    	{
    		id: idea.id,
    		title_multiloc: idea.title_multiloc,
    		url: FrontendService.new.model_to_url(idea),
    		published_at: idea.published_at,
    		author_name: idea.author_name,
    		upvotes_count: idea.upvotes_count,
    		upvotes_increment: idea_recent_votes(idea, since).select{|v| v.mode == 'up'}.count,
    		downvotes_count: idea.downvotes_count,
    		downvotes_increment: idea_recent_votes(idea, since).select{|v| v.mode == 'down'}.count,
    		comments_count: idea.comments_count,
    		comments_increment: idea_recent_comments(idea, since).count
    	}
    end

    def increase_hash timestamps, days_interval ### COPY PASTED from admin_weekly_report_job ###
    	last_2n_ago = timestamps.select{|ts| ts > (Time.now - (days_interval * 2))}
    	last_n_ago = last_2n_ago.select{|ts| ts > (Time.now - days_interval)}
    	{
    		increase: last_n_ago.size,
    		past_increase: (last_2n_ago.size - last_n_ago.size)
    	}
    end
  end
end
