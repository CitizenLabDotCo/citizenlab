module EmailCampaigns
  class Campaigns::AdminDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :user_filter_admin_only
    recipient_filter :user_filter_no_invitees

    before_send :is_content_worth_sending?

    N_TOP_IDEAS = ENV.fetch("N_ADMIN_WEEKLY_REPORT_IDEAS", 12).to_i


    def self.default_schedule
      IceCube::Schedule.new(Time.find_zone(Tenant.settings('core','timezone')).local(2019)) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
        )
      end
    end

    def self.consentable_roles
      ['admin']
    end

    def generate_commands recipient:, time: nil
      @statistics ||= statistics
      @top_project_ideas ||= top_project_ideas
      @new_initiatives ||= new_initiatives time: time
      @succesful_initiatives ||= succesful_initiatives time: time
      @idea_ids ||= @top_project_ideas.flat_map do |tpi|
        tpi[:top_ideas].map{|idea_h| idea_h[:id]}
      end
      @initiative_ids ||= (@new_initiatives + @succesful_initiatives).map do |d|
        d[:id]
      end.compact
      [{
        event_payload: {
          statistics: @statistics,
          top_project_ideas: @top_project_ideas,
          new_initiatives: @new_initiatives,
          succesful_initiatives: @succesful_initiatives
        },
        tracked_content: {
          idea_ids: @idea_ids,
          initiative_ids: @initiative_ids
        }
      }]
    end


    private

    def user_filter_admin_only users_scope, options={}
      users_scope.admin
    end

    def user_filter_no_invitees users_scope, options={}
      users_scope.active
    end

    def is_content_worth_sending? _
      @statistics ||= statistics
      !( (@statistics.dig(:activities,:new_ideas,:increase) == 0) &&
         (@statistics.dig(:activities,:new_ideas,:increase) == 0) &&
         (@statistics.dig(:activities,:new_initiatives,:increase) == 0) &&
         (@statistics.dig(:activities,:new_initiatives,:increase) == 0) &&
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
            Idea.pluck(:published_at).compact
            ),
          new_initiatives: stat_increase(
            Initiative.pluck(:published_at).compact
            ),
          new_votes: stat_increase(
            Vote.pluck(:created_at).compact
            ),
          new_comments: stat_increase(
            Comment.pluck(:created_at).compact
            ),
          total_ideas: Idea.count,
          total_initiatives: Initiative.count,
          total_users: User.count
        },
        users: {
          new_visitors: stat_increase(
            []
            ),
          new_users: stat_increase(
            User.pluck(:registration_completed_at).compact
            ),
          active_users: stat_increase(
            []
            )
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

    def top_project_ideas
      # take N_TOP_IDEAS
      top_ideas = Idea.published
      activity_counts = ideas_activity_counts top_ideas
      active_ideas = top_ideas.select do |idea|
        activity_counts.dig(idea.id, :total) > 0
      end.sort_by do |idea|
        activity_counts.dig(idea.id, :total)
      end.reverse.take N_TOP_IDEAS
      new_ideas = top_ideas.where('published_at > ?', Time.now - days_ago).sort_by do |idea|
        activity_counts.dig(idea.id, :total)
      end.reverse.take N_TOP_IDEAS
      top_idea_ids = (new_ideas + active_ideas).map(&:id).uniq
      top_ideas = top_ideas.where(id: top_idea_ids)
      # project -> top_ideas mapping
      top_project_ideas = {}
      top_ideas.each do |idea|
        top_project_ideas[idea.project_id] ||= []
        top_project_ideas[idea.project_id] += [idea]
      end
      # ordering of projects
      project_order = top_project_ideas.keys.sort_by do |project_id|
        top_project_ideas[project_id].map do |idea| 
          activity_counts.dig(idea.id, :total)
        end.inject(0){|x,y| x+y}
      end.reverse
      # payload
      project_order.map do |project_id|
        project = Project.find project_id
        phase = TimelineService.new.current_phase project
        {
          project: {
            id: project_id,
            title_multiloc: project.title_multiloc,
            url: Frontend::UrlService.new.model_to_url(project)
            
          },
          current_phase: phase && {
            id: phase.id,
            title_multiloc: phase.title_multiloc,
            participation_method: phase.participation_method,
            start_at: phase.start_at.iso8601,
            end_at: phase.end_at.iso8601
          },
          top_ideas: top_project_ideas[project_id].map{ |idea|
            {
              id: idea.id,
              title_multiloc: idea.title_multiloc,
              url: Frontend::UrlService.new.model_to_url(idea),
              published_at: idea.published_at.iso8601,
              author_name: idea.author_name,
              upvotes_count: idea.upvotes_count,
              upvotes_increment: activity_counts.dig(idea.id, :upvotes),
              downvotes_count: idea.downvotes_count,
              downvotes_increment: activity_counts.dig(idea.id, :downvotes),
              comments_count: idea.comments_count,
              comments_increment: activity_counts.dig(idea.id, :comments)
            }
          }
        }
      end
    end

    def new_initiatives time:
      Initiative.published.where('published_at > ?', (time - 1.week))
      .order(published_at: :desc).includes(:initiative_images).map do |initiative|
        {
          id: initiative.id,
          title_multiloc: initiative.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(initiative),
          published_at: initiative.published_at.iso8601,
          author_name: initiative.author_name,
          upvotes_count: initiative.upvotes_count,
          comments_count: initiative.comments_count,
          images: initiative.initiative_images.map{ |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          },
          header_bg: { 
            ordering: initiative.header_bg.ordering,
            versions: initiative.header_bg.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
          }
        }
      end
    end

    def succesful_initiatives time:
      Initiative.published
        .includes(:initiative_status_changes, :initiative_images)
        .where(
          'initiative_status_changes.initiative_status_id = ? AND initiative_status_changes.created_at > ?', 
          InitiativeStatus.where(code: 'threshold_reached').ids.first, 
          (time - 1.week)
          )
        .feedback_needed
        .map do |initiative|
        {
          id: initiative.id,
          title_multiloc: initiative.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(initiative),
          published_at: initiative.published_at.iso8601,
          author_name: initiative.author_name,
          upvotes_count: initiative.upvotes_count,
          comments_count: initiative.comments_count,
          threshold_reached_at: initiative.threshold_reached_at.iso8601,
          images: initiative.initiative_images.map{ |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          },
          header_bg: { 
            ordering: initiative.header_bg.ordering,
            versions: initiative.header_bg.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
          }
        }
      end
    end

    def ideas_activity_counts ideas
      idea_ids = ideas.pluck(:id)
      new_votes = Vote.where(votable_id: idea_ids)
        .where('created_at > ?', Time.now - days_ago)                        
      new_upvotes_counts = new_votes.where(mode: 'up')
        .group(:votable_id).count
      new_downvotes_counts = new_votes.where(mode: 'down')
        .group(:votable_id).count
      new_comments_counts = Comment.where(post_id: idea_ids)
        .where('created_at > ?', Time.now - days_ago)
        .group(:post_id).count
      idea_ids.map do |idea_id|
        upvotes = (new_upvotes_counts[idea_id] || 0)
        downvotes = (new_downvotes_counts[idea_id] || 0)
        comments = (new_comments_counts[idea_id] || 0)
        [idea_id, {
          upvotes: upvotes,
          downvotes: downvotes,
          comments: comments,
          total: (upvotes + downvotes + comments)
        }]
      end.to_h
    end

  end
end