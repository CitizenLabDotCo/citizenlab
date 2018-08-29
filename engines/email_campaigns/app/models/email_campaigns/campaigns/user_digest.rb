module EmailCampaigns
  class Campaigns::UserDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include Trackable

    before_send :is_content_worth_sending?

    N_TOP_IDEAS = ENV.fetch("N_USER_PLATFORM_DIGEST_IDEAS", 3).to_i
    N_TOP_COMMENTS = ENV.fetch("N_TOP_COMMENTS", 2).to_i
    N_DISCOVER_PROJECTS = ENV.fetch("N_DISCOVER_PROJECTS", 3).to_i


    def self.default_schedule
      IceCube::Schedule.new(Time.find_zone(Tenant.settings('core','timezone')).local(2018)) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
        )
      end
    end

    def generate_commands recipient:, time: nil
      top_ideas = top_ideas recipient
      discover_projects = discover_projects recipient
      [{
        event_payload: {
          top_ideas: top_ideas.map{ |idea|
            top_idea_payload idea, recipient
          },
          discover_projects: discover_projects.map{ |project|
            discover_projects_payload project, recipient
          }
        },
        tracked_content: {
          idea_ids: top_ideas.map(&:id),
          project_ids: discover_projects.map(&:id)
        }
      }]
    end


    private

    def is_content_worth_sending? _
      @is_worth_sending ||= TrendingIdeaService.new.filter_trending(
        IdeaPolicy::Scope.new(nil, Idea).resolve.where(publication_status: 'published')
        ).count >= N_TOP_IDEAS
      @is_worth_sending
    end

    def top_ideas recipient
      ti_service = TrendingIdeaService.new 
      top_ideas = IdeaPolicy::Scope.new(recipient, Idea)
        .resolve
        .where(publication_status: 'published')
        .left_outer_joins(:idea_status)
      top_ideas = ti_service.filter_trending top_ideas
      top_ideas = ti_service.sort_trending top_ideas
      top_ideas = top_ideas.take N_TOP_IDEAS
    end

    def discover_projects recipient
      ProjectPolicy::Scope.new(recipient, Project)
        .resolve
        .where(publication_status: 'published')
        .sort_by(&:created_at)
        .reverse
        .take(N_DISCOVER_PROJECTS)
    end

    def top_idea_payload idea, recipient
      {
        title_multiloc: idea.title_multiloc,
        body_multiloc: idea.body_multiloc,
        author_name: idea.author_name,
        upvotes_count: idea.upvotes_count,
        downvotes_count: idea.downvotes_count,
        comments_count: idea.comments_count,
        published_at: idea.published_at&.iso8601,
        url: FrontendService.new.model_to_url(idea, locale: recipient.locale),
        idea_images: idea.idea_images.map{ |image|
          {
            ordering: image.ordering,
            versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
          }
        },
        top_comments: idea.comments
          .where(publication_status: 'published')
          .sort_by{|c| -c.children.count}
          .take(N_TOP_COMMENTS).map{ |comment|
            top_comment_payload comment
          }
      }
    end

    def top_comment_payload comment
      {
        body_multiloc: comment.body_multiloc,
        created_at: comment.created_at.iso8601,
        author_first_name: comment.author&.first_name,
        author_last_name: comment.author&.last_name,
        author_locale: comment.author&.locale,
        author_avatar: comment.author.avatar&.versions&.map{|k, v| [k.to_s, v.url]}&.to_h
      }
    end

    def discover_projects_payload project, recipient
      {
        title_multiloc: project.title_multiloc,
        url: FrontendService.new.model_to_url(project, locale: recipient.locale),
        created_at: project.created_at.iso8601
      }
    end

  end
end