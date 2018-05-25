module EmailCampaigns
  class AdminWeeklyReportJob < ApplicationJob
    queue_as :default

    CAMPAIGN = 'admin_weekly_report'
    N_TOP_IDEAS = ENV.fetch("N_ADMIN_WEEKLY_REPORT_IDEAS", 12).to_i

  
    def perform last_scheduled_at=(Time.now - 7.days).to_i
      @service = EmailCampaigns::PeriodicEventsService.new

      last_scheduled_at = Time.at(last_scheduled_at)
      User.admin.each do |admin|
        days_interval = ((Time.now - last_scheduled_at) / 1.day).days

        statistics = admin_report_statistics days_interval
        if no_increase_in_stats statistics
          return
        end

        top_project_ideas = admin_report_top_project_ideas days_interval
        has_new_ideas = (top_project_ideas.size > 0)

        event = LogToSegmentService.new.tracking_message(
          "Periodic email for #{CAMPAIGN.gsub '_', ' '}", 
          user_id: admin.id,
          payload: {
              statistics: statistics,
              has_new_ideas: has_new_ideas,
              top_project_ideas: top_project_ideas
            }
          )
        
        Analytics.track event
        create_campaign_email_commands admin, top_project_ideas
      end
    end

    def admin_report_top_project_ideas days_interval
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

      top_project_ideas = {}
      top_ideas.each do |idea|
        top_project_ideas[idea.project_id] ||= []
        top_project_ideas[idea.project_id] += [idea]
      end

      project_order = top_project_ideas.keys.sort_by do |project_id|
        top_project_ideas[project_id].map{|idea| @service.activity_count(idea, since=since)}.inject(0){|x,y| x+y}
      end.reverse

      # normally, the projects will be ordered by recentness of their most recent idea
      project_order.map do |project_id|
        {
          project: LogToSegmentService.new.serialize("EmailCampaigns::DiscoverProjectSerializer", Project.find(project_id)),
          top_ideas: top_project_ideas[project_id].map{ |idea|
            @service.to_periodic_report_idea_hash(idea, since=since)
          } 
        }
      end
    end

    def admin_report_statistics days_interval
      {
        activities: {
          new_ideas: @service.increase_hash(Idea.all.map(&:published_at).compact, days_interval),
          new_comments: @service.increase_hash(Comment.all.map(&:created_at).compact, days_interval),
          new_votes: @service.increase_hash(Vote.all.map(&:created_at).compact, days_interval),
          total_ideas: Idea.count,
          total_users: User.count
        },
        users: {
          new_visitors: @service.increase_hash([], days_interval),
          new_users: @service.increase_hash(User.all.map(&:registration_completed_at).compact, days_interval),
          active_users: @service.increase_hash([], days_interval)
        } 
      }
    end

    def no_increase_in_stats stats
      ((stats.dig(:activities,:new_ideas,:increase) == 0) && 
        (stats.dig(:activities,:new_ideas,:increase) == 0) && 
        (stats.dig(:activities,:new_comments,:increase) == 0) && 
        (stats.dig(:users,:new_visitors,:increase) == 0) && 
        (stats.dig(:users,:new_users,:increase) == 0) && 
        (stats.dig(:users,:active_users,:increase) == 0))
    end

    def create_campaign_email_commands user, top_project_ideas
      # Also store projects?
      idea_ids = []
      top_project_ideas.each do |tpi|
        idea_ids += tpi[:top_ideas].map{|idea_h| idea_h[:id]}
      end
      idea_ids.uniq!
      EmailCampaigns::CampaignEmailCommand.create! campaign: CAMPAIGN, recipient: user, tracked_content: {'idea_ids': idea_ids}
    end

  end
end
