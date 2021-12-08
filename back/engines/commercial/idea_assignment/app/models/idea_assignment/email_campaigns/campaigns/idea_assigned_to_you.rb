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
module IdeaAssignment
  module EmailCampaigns
    class Campaigns::IdeaAssignedToYou < ::EmailCampaigns::Campaign
      include ::EmailCampaigns::Consentable
      include ::EmailCampaigns::ActivityTriggerable
      include ::EmailCampaigns::Disableable
      include ::EmailCampaigns::Trackable
      include ::EmailCampaigns::LifecycleStageRestrictable

      allow_lifecycle_stages only: %w[trial active]

      recipient_filter :filter_notification_recipient

      def self.consentable_roles
        %w[admin project_moderator]
      end

      def mailer_class
        IdeaAssignedToYouMailer
      end

      def activity_triggers
        { 'IdeaAssignment::Notifications::IdeaAssignedToYou' => { 'created' => true } }
      end

      def self.category
        'admin'
      end

      def filter_notification_recipient(users_scope, activity:, time: nil)
        users_scope.where(id: activity.item.recipient.id)
      end

      def generate_commands(recipient:, activity:, time: nil)
        notification = activity.item
        name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
        [{
          event_payload: {
            post_title_multiloc: notification.post.title_multiloc,
            post_body_multiloc: notification.post.body_multiloc,
            post_author_name: name_service.display_name!(notification.post.author),
            post_published_at: notification.post.published_at&.iso8601,
            post_url: Frontend::UrlService.new.model_to_url(notification.post, locale: recipient.locale),
            post_assigned_at: notification.post.assigned_at&.iso8601
          }
        }]
      end
    end
  end
end
