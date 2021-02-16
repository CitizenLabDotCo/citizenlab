module EmailCampaigns
  class Campaigns::AssigneeDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :user_filter_admins_moderators_only

    N_TOP_IDEAS = ENV.fetch("N_ASSIGNEE_WEEKLY_REPORT_IDEAS", 12).to_i


    def self.default_schedule
      IceCube::Schedule.new(Time.find_zone(AppConfiguration.instance.settings('core','timezone')).local(2019)) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:tuesday).hour_of_day(8)
        )
      end
    end

    def self.consentable_roles
      ['admin', 'project_moderator']
    end

    def self.category
      'admin'
    end

    def mailer_class
      AssigneeDigestMailer
    end

    def generate_commands recipient:, time: nil
      time ||= Time.now
      assigned = {
        assigned_ideas: assigned_ideas(recipient: recipient, time: time),
        assigned_initiatives: assigned_initiatives(recipient: recipient, time: time),
        succesful_assigned_initiatives: succesful_assigned_initiatives(recipient: recipient, time: time)
      }
      tracked_content = {
        idea_ids: assigned[:assigned_ideas].map{ |i|
          i[:id]
        }.compact,
        initiative_ids: (assigned[:assigned_initiatives] + assigned[:succesful_assigned_initiatives]).map{ |i|
          i[:id]
        }.compact,
      }
      if assigned.values.any?(&:present?)
        [{
          event_payload: {
            **assigned,
            need_feedback_assigned_ideas_count: StatIdeaPolicy::Scope.new(recipient, Idea.published).resolve.where(assignee: recipient).feedback_needed.count,
          },
          tracked_content: tracked_content
        }]
      else
        []
      end
    end


    private

    def user_filter_admins_moderators_only users_scope, options={}
      users_scope.admin.or(users_scope.project_moderator)
    end

    def assigned_ideas recipient:, time:
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      recipient.assigned_ideas
        .feedback_needed
        .order(published_at: :desc)
        .take(N_TOP_IDEAS)
        .map do |idea|
          {
            id: idea.id,
            title_multiloc: idea.title_multiloc,
            url: Frontend::UrlService.new.model_to_url(idea),
            published_at: idea.published_at&.iso8601,
            assigned_at: idea.assigned_at&.iso8601,
            author_name: name_service.display_name!(idea.author),
            upvotes_count: idea.upvotes_count,
            downvotes_count: idea.downvotes_count,
            comments_count: idea.comments_count,
          }
        end
    end

    def assigned_initiatives recipient:, time:
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      recipient.assigned_initiatives.published
        .where('assigned_at > ?', time - 1.week)
        .order(assigned_at: :desc)
        .includes(:initiative_images)
        .map do |initiative|
          {
            id: initiative.id,
            title_multiloc: initiative.title_multiloc,
            url: Frontend::UrlService.new.model_to_url(initiative),
            published_at: initiative.published_at&.iso8601,
            assigned_at: initiative.assigned_at&.iso8601,
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

    def succesful_assigned_initiatives recipient:, time:
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      threshold_reached_id = InitiativeStatus.where(code: 'threshold_reached').ids.first
      recipient.assigned_initiatives
        .joins(:initiative_status_changes)
        .where(
          'initiative_status_changes.initiative_status_id = ? AND initiative_status_changes.created_at > ?',
          threshold_reached_id,
          (time - 1.week)
          )
        .feedback_needed
        .order(upvotes_count: :desc)
        .includes(:initiative_images)
        .map do |initiative|
          {
            id: initiative.id,
            title_multiloc: initiative.title_multiloc,
            url: Frontend::UrlService.new.model_to_url(initiative),
            published_at: initiative.published_at&.iso8601,
            assigned_at: initiative.assigned_at&.iso8601,
            author_name: name_service.display_name!(initiative.author),
            upvotes_count: initiative.upvotes_count,
            comments_count: initiative.comments_count,
            threshold_reached_at: initiative.threshold_reached_at&.iso8601,
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

  end
end
