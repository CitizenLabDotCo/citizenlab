module EmailCampaigns
  class ModeratorDigestJob < ApplicationJob
    queue_as :default

    CAMPAIGN = 'moderator_digest'
    N_TOP_IDEAS = ENV.fetch("N_MODERATOR_DIGEST_IDEAS", 12).to_i

  
    def perform last_scheduled_at=(Time.now - 7.days).to_i
      last_scheduled_at = Time.at(last_scheduled_at)
      Project.all.each do |project|
        days_interval = ((Time.now - last_scheduled_at) / 1.day).days

        statistics = moderator_digest_statistics project, days_interval
        top_ideas = moderator_digest_top_ideas project, days_interval
        has_new_ideas = (top_ideas.size > 0)

        break if !has_new_ideas

        serialized_project = LogToSegmentService.new.serialize "EmailCampaigns::DiscoverProjectSerializer", project
      	User.project_moderators(project.id).select{|user| !user.admin?}.each do |moderator|
	        event = LogToSegmentService.new.tracking_message(
            "Periodic email for #{CAMPAIGN.gsub '_', ' '}", 
            user_id: moderator.id,
            payload: {
                statistics: statistics,
                has_new_ideas: has_new_ideas,
                project: serialized_project,
                top_ideas: top_ideas.take(N_TOP_IDEAS)
              }
            )
	        Analytics.track event
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
      ps = ParticipantsService.new
      participants_increase = ps.participants(project: project, since: (Time.now - days_interval)).size
      participants_past_increase = ps.participants(project: project, since: (Time.now - days_interval * 2)).size - participants_increase
      ideas = project.ideas
      comments = Comment.where(idea_id: ideas.map(&:id))
      votes = Vote.where(votable_id: (ideas.map(&:id) + comments.map(&:id)))
      {
        activities: {
          new_ideas: increase_hash(ideas.map(&:published_at).compact, days_interval),
          new_comments: increase_hash(comments.map(&:created_at).compact, days_interval), # TODO
          new_votes: increase_hash(votes.map(&:created_at), days_interval), # TODO
          total_ideas: ideas.count
        },
        users: {
          new_visitors: increase_hash([], days_interval), # TODO
          new_participants: {
            increase: participants_increase,
            past_increase: participants_past_increase
          },
          total_participants: ps.participants(project: project).count
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
