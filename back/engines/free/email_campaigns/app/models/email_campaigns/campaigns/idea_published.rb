module EmailCampaigns
  class Campaigns::IdeaPublished < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_recipient

    def mailer_class
      IdeaPublishedMailer
    end

    def activity_triggers
      {'Idea' => {'published' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.author_id)
    end

    def self.category
      'own'
    end

    def generate_commands recipient:, activity:
      idea = activity.item
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
          }
        }
      }]
    end
  end
end
