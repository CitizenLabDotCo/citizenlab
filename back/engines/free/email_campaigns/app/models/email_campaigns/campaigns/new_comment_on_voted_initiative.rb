module EmailCampaigns
  class Campaigns::NewCommentOnVotedInitiative < Campaign
    include ActivityTriggerable
    include Consentable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_recipient

    def mailer_class
      NewCommentOnVotedInitiativeMailer
    end

    def activity_triggers
      {'Comment' => {'created' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      users_scope
        .where(id: activity.item.post.votes.pluck(:user_id))
        .where.not(id: activity.item.author_id)
        .where.not(id: activity.item.post.author_id)
        .where.not(id: activity.item.post.comments.pluck(:author_id))
    end

    def self.category
      'voted'
    end

    def generate_commands recipient:, activity:, time: nil
      comment = activity.item
      return [] if comment.post_type != 'Initiative'
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      [{
        event_payload: {
          initiating_user_first_name: comment.author&.first_name,
          initiating_user_last_name: name_service.last_name!(comment.author),
          post_published_at: comment.post.published_at.iso8601,
          post_title_multiloc: comment.post.title_multiloc,
          comment_body_multiloc: comment.body_multiloc,
          comment_url: Frontend::UrlService.new.model_to_url(comment, locale: recipient.locale)
        }
      }]
    end

    def set_enabled
      self.enabled = false if self.enabled.nil?
    end

  end
end
