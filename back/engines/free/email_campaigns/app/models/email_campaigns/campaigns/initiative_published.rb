module EmailCampaigns
  class Campaigns::InitiativePublished < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_recipient

    def mailer_class
      InitiativePublishedMailer
    end

    def activity_triggers
      {'Initiative' => {'published' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.author_id)
    end

    def self.category
      'own'
    end

    def generate_commands recipient:, activity:
      initiative = activity.item
      [{
        event_payload: {
          post_id: initiative.id,
          post_title_multiloc: initiative.title_multiloc,
          post_body_multiloc: initiative.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale),
          post_images: initiative.initiative_images.map{ |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          },
          initiative_header_bg: {
            versions: initiative.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
          },
          initiative_votes_needed: initiative.votes_needed,
          initiative_expires_at: initiative.expires_at.iso8601
        }
      }]
    end
  end
end
