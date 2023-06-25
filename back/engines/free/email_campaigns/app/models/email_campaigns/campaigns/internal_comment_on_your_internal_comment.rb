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
  class Campaigns::InternalCommentOnYourInternalComment < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_notification_recipient

    def activity_triggers
      { 'Notifications::InternalComments::InternalCommentOnYourInternalComment' => { 'created' => true } }
    end

    def filter_notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.consentable_roles
      %w[admin project_moderator project_folder_moderator]
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins_and_managers'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.admins_and_managers'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.internal_comments'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.user_replies_to_internal_comment'
    end

    def mailer_class
      InternalCommentOnYourInternalCommentMailer
    end

    def generate_commands(recipient:, activity:, time: nil)
      notification = activity.item
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      [{
        event_payload: {
          initiating_user_first_name: notification.initiating_user&.first_name,
          initiating_user_last_name: name_service.last_name!(notification.initiating_user),
          internal_comment_author_name: name_service.display_name!(notification.internal_comment.author),
          internal_comment_body: notification.internal_comment.body,
          internal_comment_url: Frontend::UrlService.new.model_to_url(notification.internal_comment, locale: recipient.locale),
          post_title_multiloc: notification.post.title_multiloc,
          post_body_multiloc: notification.post.body_multiloc,
          post_type: notification.post_type,
          post_images: post_images(notification)
        }
      }]
    end

    def post_images(notification)
      if notification.post_type == 'Idea'
        notification.post.idea_images.map { |image| serialize_image(image) }
      elsif notification.post_type == 'Initiative'
        notification.post.initiative_images.map { |image| serialize_image(image) }
      end
    end

    def serialize_image(image)
      {
        ordering: image.ordering,
        versions: version_urls(image.image)
      }
    end

    def version_urls(image)
      image.versions.to_h { |k, v| [k.to_s, v.url] }
    end
  end
end
