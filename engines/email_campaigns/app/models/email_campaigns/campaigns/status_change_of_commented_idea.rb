module EmailCampaigns
  class Campaigns::StatusChangeOfCommentedIdea < Campaign
    include ActivityTriggerable
    include Consentable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_recipient

    def mailer_class
      StatusChangeOfCommentedIdeaMailer
    end

    def activity_triggers
      {'Idea' => {'changed_status' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      users_scope
        .where(id: activity.item.comments.pluck(:author_id))
        .where.not(id: activity.item.author_id)
    end

    def self.category
      'commented'
    end

    def generate_commands recipient:, activity:
      idea = activity.item
      status = idea.idea_status
      [{
        event_payload: {
          post_id: idea.id,
          post_title_multiloc: idea.title_multiloc,
          post_body_multiloc: idea.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale),
          post_images: idea.idea_images.map{ |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          },
          idea_status_id: status.id,
          idea_status_title_multiloc: status.title_multiloc,
          idea_status_code: status.code,
          idea_status_color: status.color
        }
      }]
    end

  end
end
