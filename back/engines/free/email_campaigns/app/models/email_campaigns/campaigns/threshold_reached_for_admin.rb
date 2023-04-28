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
  class Campaigns::ThresholdReachedForAdmin < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_notification_recipient

    def mailer_class
      ThresholdReachedForAdminMailer
    end

    def self.consentable_roles
      ['admin']
    end

    def activity_triggers
      { 'Notifications::ThresholdReachedForAdmin' => { 'created' => true } }
    end

    def filter_notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.category
      'admin'
    end

    def self.recipient_role_label
      I18n.t('email_campaigns.admin_labels.recipient_role.admins')
    end

    def self.recipient_segment_label
      I18n.t('email_campaigns.admin_labels.recipient_segment.admins_and_managers')
    end

    def self.content_type_label
      I18n.t('email_campaigns.admin_labels.content_type.proposals')
    end

    def self.trigger_label
      I18n.t('email_campaigns.admin_labels.trigger.proposal_is_upvoted_above_threshold')
    end

    def generate_commands(recipient:, activity:, time: nil)
      notification = activity.item
      assignee_attributes = {}
      if notification.post.assignee_id
        assignee_attributes[:assignee_first_name] = notification.post.assignee.first_name
        assignee_attributes[:assignee_last_name] = notification.post.assignee.last_name
      end
      [{
        event_payload: {
          post_title_multiloc: notification.post.title_multiloc,
          post_body_multiloc: notification.post.body_multiloc,
          post_published_at: notification.post.published_at.iso8601,
          post_author_name: notification.post.author_name,
          post_url: Frontend::UrlService.new.model_to_url(notification.post, locale: recipient.locale),
          post_upvotes_count: notification.post.upvotes_count,
          post_comments_count: notification.post.comments_count,
          post_images: notification.post.initiative_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
            }
          end,
          initiative_header_bg: {
            versions: notification.post.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
          },
          **assignee_attributes
        }
      }]
    end

    protected

    def set_enabled
      self.enabled = true if enabled.nil?
    end
  end
end
