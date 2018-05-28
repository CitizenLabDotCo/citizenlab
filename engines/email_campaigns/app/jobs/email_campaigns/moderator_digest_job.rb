module EmailCampaigns
  class ModeratorDigestJob < ApplicationJob
    queue_as :default

    CAMPAIGN = 'moderator_digest'
    N_TOP_IDEAS = ENV.fetch("N_MODERATOR_DIGEST_IDEAS", 12).to_i

  
    def perform last_scheduled_at=(Time.now - 7.days).to_i
      @service = EmailCampaigns::PeriodicEventsService.new

      last_scheduled_at = Time.at(last_scheduled_at)
      Project.all.each do |project|
        days_interval = ((Time.now - last_scheduled_at) / 1.day).days

        statistics = moderator_digest_statistics project, days_interval
        top_ideas = moderator_digest_top_ideas project, days_interval
        has_new_ideas = (top_ideas.size > 0)

        break if !has_new_ideas

        serialized_project = LogToSegmentService.new.serialize "EmailCampaigns::DiscoverProjectSerializer", project
      	User.project_moderators(project.id).select{|user| !user.admin?}.each do |moderator|
          event = @service.periodic_event CAMPAIGN, moderator.id,
            {
              statistics: statistics,
              has_new_ideas: has_new_ideas,
              project: serialized_project,
              top_ideas: top_ideas.take(N_TOP_IDEAS)
            }

          Analytics.track event
	        create_campaign_email_commands moderator, top_ideas
	      end
      end
    end

    def moderator_digest_top_ideas project, days_interval
      since = Time.now - days_interval

      top_ideas = Idea.where(publication_status: 'published').all
      top_ideas = top_ideas.select do |idea| 
        (@service.activity_count(idea, since=since) > 0) || (idea.published_at > since)
      end
      
      top_ideas = top_ideas.sort_by do |idea| 
        @service.activity_score(idea, since=since)
      end.reverse.take N_TOP_IDEAS
      top_ideas = top_ideas.sort_by do |idea| 
        @service.activity_count(idea, since=since)
      end.reverse

      top_ideas.map do |idea|
        @service.to_periodic_report_idea_hash(idea, since=since)
      end
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
          new_ideas: @service.increase_hash(
            ideas.map(&:published_at).compact, 
            days_interval
            ),
          new_comments: @service.increase_hash(
            comments.map(&:created_at).compact, 
            days_interval
            ),
          new_votes: @service.increase_hash(
            votes.map(&:created_at), 
            days_interval
            ),
          total_ideas: ideas.count
        },
        users: {
          new_visitors: @service.increase_hash(
            [], 
            days_interval
            ),
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

  end
end
