module EmailCampaigns
  class Campaigns::ModeratorDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable

    recipient_filter :user_filter_moderator_only
    before_send :is_content_worth_sending?

    N_TOP_IDEAS = ENV.fetch("N_MODERATOR_DIGEST_IDEAS", 12).to_i


    def self.default_schedule
      IceCube::Schedule.new(Time.find_zone(Tenant.settings('core','timezone')).local(2018)) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
        )
      end
    end

    def self.consentable_roles
      ['moderator']
    end

    def generate_command recipient:, time: nil
      project = Project.find recipient.moderatable_project_ids.first
      statistics = statistics project
      top_ideas = top_ideas project
      idea_ids = top_ideas.map{|top_idea| top_idea[:id]}
      {
        event_payload: {
          statistics: @statistics,
          top_project_ideas: @top_project_ideas,
          has_new_ideas: (@top_project_ideas.size > 0)
        },
        tracked_content: {
          idea_ids: @idea_ids
        }
      }
    end


    private

    def user_filter_moderator_only users_scope, options={}
      users_scope.where("roles @> '[{\"type\":\"moderator\"}]'")
    end

    def is_content_worth_sending? _
      # TODO figure out which moderator and project we're talking about
      true
    end

    def statistics project
      ps = ParticipantsService.new
      participants_increase = ps.participants(project: project, since: (Time.now - days_ago)).size
      participants_past_increase = ps.participants(project: project, since: (Time.now - (days_ago * 2))).size - participants_increase
      ideas = Idea.published.where project_id: project.id
      comments = Comment.where(idea_id: ideas.map(&:id))
      votes = Vote.where(votable_id: (ideas.map(&:id) + comments.map(&:id)))
      {
        activities: {
          new_ideas: stat_increase(
            ideas.map(&:published_at).compact
            ),
          new_votes: stat_increase(
            votes.map(&:created_at).compact
            ),
          new_comments: stat_increase(
            comments.map(&:created_at).compact
            ),
          total_ideas: ideas.count
        },
        users: {
          new_visitors: stat_increase(
            []
            ),
          new_participants: {
            increase: participants_increase,
            past_increase: participants_past_increase
          },
          total_participants: ps.participants(project: project).count
        }
      }
    end

    def days_ago
      t_1, t_2 = ic_schedule.first 2
      t_2 ||= t_1 + 7.days
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

    def top_ideas project
      # take N_TOP_IDEAS
      top_ideas = Idea.published.where project_id: project.id
      top_ideas = top_ideas.all.select do |idea|
        idea_activity_count(idea) > 0 || idea.published_at > Time.now - days_ago
      end
      top_ideas = top_ideas.sort_by do |idea| 
        idea_activity_count idea
      end.reverse.take N_TOP_IDEAS
      # payload
      top_ideas.map{ |idea|
        new_votes = idea.votes.where('created_at > ?', Time.now - days_ago)
        {
          id: idea.id,
          title_multiloc: idea.title_multiloc,
          url: FrontendService.new.model_to_url(idea),
          published_at: idea.published_at.iso8601,
          author_name: idea.author_name,
          upvotes_count: idea.upvotes_count,
          upvotes_increment: new_votes.where(mode: 'up').count,
          downvotes_count: idea.downvotes_count,
          downvotes_increment: new_votes.where(mode: 'down').count,
          comments_count: idea.comments_count,
          comments_increment: idea.comments.where('created_at > ?', Time.now - days_ago).count
        }
      }
    end

    def idea_activity_count idea
      new_vote_count = idea.votes.where('created_at > ?', Time.now - days_ago).count
      new_comments_count = idea.comments.where('created_at > ?', Time.now - days_ago).count
      new_vote_count + new_comments_count
    end

  end
end