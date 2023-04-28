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
  class Campaigns::CommentOnYourInitiative < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_notification_recipient

    def mailer_class
      CommentOnYourInitiativeMailer
    end

    def activity_triggers
      { 'Notifications::CommentOnYourInitiative' => { 'created' => true } }
    end

    def filter_notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.category
      'own'
    end

    def self.recipient_role_label
      @multiloc_service ||= MultilocService.new
      @multiloc_service.i18n_to_multiloc('email_campaigns.admin_labels.recipient_role.registered_users')
    end

    def self.recipient_segment_label
      @multiloc_service ||= MultilocService.new
      @multiloc_service.i18n_to_multiloc('email_campaigns.admin_labels.recipient_segment.users_engaged_with_the_proposal')
    end

    def self.content_type_label
      @multiloc_service ||= MultilocService.new
      @multiloc_service.i18n_to_multiloc('email_campaigns.admin_labels.content_type.comments')
    end

    def self.trigger_label
      @multiloc_service ||= MultilocService.new
      @multiloc_service.i18n_to_multiloc('email_campaigns.admin_labels.trigger.user_comments')
    end

    def generate_commands(recipient:, activity:, time: nil)
      notification = activity.item
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      [{
        event_payload: {
          initiating_user_first_name: notification.initiating_user&.first_name,
          initiating_user_last_name: name_service.last_name!(notification.initiating_user),
          comment_author_name: name_service.display_name!(notification.comment.author),
          comment_body_multiloc: notification.comment.body_multiloc,
          comment_url: Frontend::UrlService.new.model_to_url(notification.comment, locale: recipient.locale),
          post_published_at: notification.post.published_at.iso8601,
          post_title_multiloc: notification.post.title_multiloc,
          post_author_name: name_service.display_name!(notification.post.author)
        }
      }]
    end
  end
end
