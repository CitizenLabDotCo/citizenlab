module EmailCampaigns
  class Campaigns::AssigneeDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable

    recipient_filter :user_filter_admins_moderators_only

    N_TOP_IDEAS = ENV.fetch("N_ASSIGNEE_WEEKLY_REPORT_IDEAS", 12).to_i


    def self.default_schedule
      IceCube::Schedule.new(Time.find_zone(Tenant.settings('core','timezone')).local(2018)) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:tuesday).hour_of_day(8)
        )
      end
    end

    def self.consentable_roles
      ['admin', 'project_moderator']
    end

    def generate_commands recipient:, time: nil
      @assigned_ideas = recipient.assigned_ideas
        .where('published_at > ?', (time - 1.week))
        .order(created_at: :desc)
        .take(N_TOP_IDEAS)
      end
      [{
        event_payload: {
          assigned_ideas: @assigned_ideas.map{ |idea|
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
        },
        tracked_content: {
          idea_ids: @assigned_ideas.ids
        }
      }]
    end


    private

    def user_filter_admins_moderators_only users_scope, options={}
      users_scope.admin.or(user_scope.project_moderator)
    end

  end
end