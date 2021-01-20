module EmailCampaigns
  class Campaigns::StatusChangeOfCommentedInitiative < Campaign
    include ActivityTriggerable
    include Consentable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_recipient

    def mailer_class
      StatusChangeOfCommentedInitiativeMailer
    end

    def activity_triggers
      {'Initiative' => {'changed_status' => true}}
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
      initiative = activity.item
      status = initiative.initiative_status
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
          initiative_status_id: status.id,
          initiative_status_title_multiloc: status.title_multiloc,
          initiative_status_code: status.code,
          initiative_status_color: status.color
        }
      }]
    end

  end
end
