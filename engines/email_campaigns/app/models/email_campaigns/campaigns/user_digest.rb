module EmailCampaigns
  class Campaigns::UserDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :user_filter_no_invitees

    before_send :is_content_worth_sending?

    N_TOP_IDEAS = ENV.fetch("N_USER_PLATFORM_DIGEST_IDEAS", 3).to_i
    N_TOP_COMMENTS = ENV.fetch("N_TOP_COMMENTS", 2).to_i
    N_DISCOVER_PROJECTS = ENV.fetch("N_DISCOVER_PROJECTS", 3).to_i


    def self.default_schedule
      IceCube::Schedule.new(Time.find_zone(Tenant.settings('core','timezone')).local(2019)) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
        )
      end
    end

    def self.category
      'scheduled'
    end

    def generate_commands recipient:, time: nil
      time ||= Time.now
      top_ideas = top_ideas recipient
      discover_projects = discover_projects recipient
      name_service = UserDisplayNameService.new(Tenant.current, recipient)
      @new_initiatives ||= new_initiatives(name_service, time: time)
      @succesful_initiatives ||= succesful_initiatives(name_service, time: time)
      @initiative_ids ||= (@new_initiatives + @succesful_initiatives).map do |d|
        d[:id]
      end.compact
      [{
        event_payload: {
          top_ideas: top_ideas.map{ |idea|
            top_idea_payload idea, recipient
          },
          discover_projects: discover_projects.map{ |project|
            discover_projects_payload project, recipient
          },
          new_initiatives: @new_initiatives,
          succesful_initiatives: @succesful_initiatives
        },
        tracked_content: {
          idea_ids: top_ideas.ids,
          initiative_ids: @initiative_ids,
          project_ids: discover_projects.ids
        }
      }]
    end

    # @return [Boolean]
    def is_content_worth_sending? _
      @is_worth_sending ||= TrendingIdeaService.new.filter_trending(
        IdeaPolicy::Scope.new(nil, Idea).resolve.where(publication_status: 'published')
        ).count('*') >= N_TOP_IDEAS
    end

    private

    def user_filter_no_invitees users_scope, options={}
      users_scope.active
    end

    def top_ideas recipient
      ti_service = TrendingIdeaService.new
      top_ideas = IdeaPolicy::Scope.new(recipient, Idea).resolve
        .published

      truly_trending_ids = ti_service.filter_trending(top_ideas).ids
      top_ideas = ti_service.sort_trending top_ideas.where(id: truly_trending_ids)
      top_ideas.limit N_TOP_IDEAS
    end

    def discover_projects recipient
      ProjectPolicy::Scope.new(recipient, Project)
        .resolve
        .left_outer_joins(:admin_publication)
        .where(admin_publications: {publication_status: 'published'})
        .order(created_at: :desc)
        .limit(N_DISCOVER_PROJECTS)
    end

    def top_idea_payload idea, recipient
      name_service = UserDisplayNameService.new(Tenant.current, recipient)
      {
        title_multiloc: idea.title_multiloc,
        body_multiloc: idea.body_multiloc,
        author_name: name_service.display_name!(idea.author),
        upvotes_count: idea.upvotes_count,
        downvotes_count: idea.downvotes_count,
        comments_count: idea.comments_count,
        published_at: idea.published_at&.iso8601,
        url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale),
        idea_images: idea.idea_images.map{ |image|
          {
            ordering: image.ordering,
            versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
          }
        },
        top_comments: idea.comments
          .where(publication_status: 'published')
          .sort_by{|c| -c.children.size}
          .take(N_TOP_COMMENTS).map{ |comment|
            top_comment_payload comment, name_service
          }
      }
    end

    def top_comment_payload comment, name_service
      {
        body_multiloc: comment.body_multiloc,
        created_at: comment.created_at.iso8601,
        author_first_name: comment.author&.first_name,
        author_last_name: name_service.last_name!(comment.author),
        author_locale: comment.author&.locale,
        author_avatar: comment.author.avatar&.versions&.map{|k, v| [k.to_s, v.url]}&.to_h
      }
    end

    def discover_projects_payload project, recipient
      {
        title_multiloc: project.title_multiloc,
        url: Frontend::UrlService.new.model_to_url(project, locale: recipient.locale),
        created_at: project.created_at.iso8601
      }
    end

    def new_initiatives name_service, time:
      Initiative.published.where('published_at > ?', (time - 1.week)).includes(:initiative_images).map do |initiative|
        {
          id: initiative.id,
          title_multiloc: initiative.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(initiative),
          published_at: initiative.published_at.iso8601,
          author_name: name_service.display_name!(initiative.author),
          upvotes_count: initiative.upvotes_count,
          comments_count: initiative.comments_count,
          images: initiative.initiative_images.map{ |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          },
          header_bg: {
            versions: initiative.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
          }
        }
      end
    end

    def succesful_initiatives name_service, time:
      Initiative.published
        .left_outer_joins(:initiative_status_changes, :initiative_images)
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
          author_name: name_service.display_name!(initiative.author),
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
            versions: initiative.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
          }
        }
      end
    end

    def days_ago
      t_1, t_2 = ic_schedule.first 2
      t_2 ||= t_1 + 7.days
      ((t_2 - t_1) / 1.day).days
    end

  end
end
