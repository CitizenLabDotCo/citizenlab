module EmailCampaigns
  class Campaigns::AdminDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable

    recipient_filter :user_filter_admin_only
    before_send :is_content_worth_sending?

    N_TOP_IDEAS = ENV.fetch("N_ADMIN_WEEKLY_REPORT_IDEAS", 12).to_i


    def self.default_schedule
      IceCube::Schedule.new(Time.find_zone(Tenant.settings('core','timezone')).local(2018)) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
        )
      end
    end

    def consentable_roles
      ['admin']
    end

    def generate_command recipient:, time: nil
      @top_project_ideas ||= top_project_ideas
      @idea_ids ||= top_project_ideas.flat_map do |tpi|
        tpi[:top_ideas].map{|idea_h| idea_h[:id]}
      end
      {
        event_payload: {
          statistics: @statistics,
          top_project_ideas: @top_project_ideas,
          has_new_ideas: (@top_project_ideas.size > 0)
        },
        tracked_content: {
          idea_ids: idea_ids
        }
      }
    end


    private

    def user_filter_admin_only users_scope, options={}
      users_scope.admin
    end

    def is_content_worth_sending?
      @statistics ||= statistics
      !( (@statistics.dig(:activities,:new_ideas,:increase) == 0) &&
         (@statistics.dig(:activities,:new_ideas,:increase) == 0) &&
         (@statistics.dig(:activities,:new_comments,:increase) == 0) &&
         (@statistics.dig(:users,:new_visitors,:increase) == 0) &&
         (@statistics.dig(:users,:new_users,:increase) == 0) &&
         (@statistics.dig(:users,:active_users,:increase) == 0)
         )
    end


    def statistics
      {
        activities: {
          new_ideas: stat_increase(
            Idea.all.map(&:published_at).compact
            ),
          new_comments: stat_increase(
            Comment.all.map(&:created_at).compact
            ),
          total_ideas: Idea.count,
          total_users: User.count
        },
        users: {
          new_visitors: stat_increase(
            []
            ),
          new_users: stat_increase(
            User.all.map(&:registration_completed_at).compact
            ),
          active_users: stat_increase(
            []
            )
        }
      }
    end

    def days_ago
      t_1, t_2 = ic_schedule.first 2
      ((t_2 - t_1) / 1.day).days
    end

    def stat_increase ts
      second_last_agos = ts.select{|t| t > (Time.now - (days_ago * 2))}
      last_agos = second_last_agos.select{|t| t > (Time.now - days_ago)}
      {
        increase: last_agos.size,
        past_increase: second_last_agos.size
      }
    end

    def top_project_ideas
      # take N_TOP_IDEAS
      top_ideas = Idea.where(publication_status: 'published')
      top_ideas = top_ideas.all.select do |idea|
        idea_activity_count(idea) > 0 || idea.published_at > Time.now - days_ago
      end
      top_ideas = top_ideas.sort_by do |idea| 
        idea_activity_count idea
      end.reverse.take N_TOP_IDEAS
      # project -> top_ideas mapping
      top_project_ideas = {}
      top_ideas.each do |idea|
        top_project_ideas[idea.project_id] ||= []
        top_project_ideas[idea.project_id] += [idea]
      end
      # ordering of projects
      project_order = top_project_ideas.keys.sort_by do |project_id|
        top_project_ideas[project_id].map do |idea| 
          idea_activity_count idea
        end.inject(0){|x,y| x+y}
      end.reverse
      # payload
      project_order.map do |project_id|
        project = Project.find project_id
        phase = TimelineService.new.current_phase project
        {
          project: {
            project: {
              id: project_id,
              title_multiloc: project.title_multiloc,
              url: FrontendService.new.model_to_url(project)
            },
            current_phase: {
              id: phase.id,
              title_multiloc: phase.title_multiloc,
              participation_method: phase.participation_method,
              start_at: phase.start_at.to_s,
              end_at: phase.end_at.to_s
            }
          },
          top_ideas: top_project_ideas[project_id].map{ |idea|
            new_votes = idea.votes.where('created_at > ?', Time.now - days_ago)
            {
              id: idea.id,
              title_multiloc: idea.title_multiloc,
              url: FrontendService.new.model_to_url(idea),
              published_at: idea.published_at,
              author_name: idea.author_name,
              upvotes_count: idea.upvotes_count,
              upvotes_increment: new_votes.where(mode: 'up').count,
              downvotes_count: idea.downvotes_count,
              downvotes_increment: new_votes.where(mode: 'down').count,
              comments_count: idea.comments_count,
              comments_increment: idea.comments.where('created_at > ?', Time.now - days_ago).count
            }
          }
        }
      end
    end

    def idea_activity_count idea
      new_vote_count = idea.votes.where('created_at > ?', Time.now - days_ago).count
      new_comments_count = idea.comments.where('created_at > ?', Time.now - days_ago).count
      new_vote_count + new_comments_count
    end

  end
end