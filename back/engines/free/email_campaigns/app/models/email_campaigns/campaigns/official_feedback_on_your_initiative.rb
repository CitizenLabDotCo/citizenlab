# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_campaigns
#
#  id               :uuid             not null, primary key
#  type             :string           not null
#  author_id        :uuid
#  enabled          :boolean
#  sender           :string
#  reply_to         :string
#  schedule         :jsonb
#  subject_multiloc :jsonb
#  body_multiloc    :jsonb
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  deliveries_count :integer          default(0), not null
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id  (author_id)
#  index_email_campaigns_campaigns_on_type       (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
module EmailCampaigns
  class Campaigns::OfficialFeedbackOnYourInitiative < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_notification_recipient

    def mailer_class
      OfficialFeedbackOnYourInitiativeMailer
    end

    def activity_triggers
      { 'Notifications::OfficialFeedbackOnYourInitiative' => { 'created' => true } }
    end

    def filter_notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.category
      'own'
    end

    def generate_commands(recipient:, activity:, time: nil)
      notification = activity.item
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      [{
        event_payload: {
          official_feedback_author_multiloc: notification.official_feedback.author_multiloc,
          official_feedback_body_multiloc: notification.official_feedback.body_multiloc,
          official_feedback_url: Frontend::UrlService.new.model_to_url(notification.official_feedback, locale: recipient.locale),
          post_published_at: notification.post.published_at.iso8601,
          post_title_multiloc: notification.post.title_multiloc,
          post_author_name: name_service.display_name!(notification.post.author)
        }
      }]
    end
  end
end
