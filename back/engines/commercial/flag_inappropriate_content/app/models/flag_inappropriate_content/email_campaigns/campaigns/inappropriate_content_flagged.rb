# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_campaigns
#
#  id                   :uuid             not null, primary key
#  type                 :string           not null
#  author_id            :uuid
#  enabled              :boolean
#  sender               :string
#  reply_to             :string
#  schedule             :jsonb
#  subject_multiloc     :jsonb
#  body_multiloc        :jsonb
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  deliveries_count     :integer          default(0), not null
#  context_id           :uuid
#  title_multiloc       :jsonb
#  intro_multiloc       :jsonb
#  button_text_multiloc :jsonb
#  context_type         :string
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id   (author_id)
#  index_email_campaigns_campaigns_on_context_id  (context_id)
#  index_email_campaigns_campaigns_on_type        (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
module FlagInappropriateContent
  module EmailCampaigns
    class Campaigns::InappropriateContentFlagged < ::EmailCampaigns::Campaign
      include ::EmailCampaigns::Consentable
      include ::EmailCampaigns::ActivityTriggerable
      include ::EmailCampaigns::Disableable
      include ::EmailCampaigns::Trackable
      include ::EmailCampaigns::ContentConfigurable
      include ::EmailCampaigns::LifecycleStageRestrictable

      allow_lifecycle_stages only: %w[trial active]

      recipient_filter :filter_notification_recipient

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
        'email_campaigns.admin_labels.content_type.content_moderation'
      end

      def self.trigger_multiloc_key
        'email_campaigns.admin_labels.trigger.content_gets_flagged_as_innapropiate'
      end

      def mailer_class
        InappropriateContentFlaggedMailer
      end

      def activity_triggers
        { 'FlagInappropriateContent::Notifications::InappropriateContentFlagged' => { 'created' => true } }
      end

      def filter_notification_recipient(users_scope, activity:, time: nil)
        users_scope.where(id: activity.item.recipient_id)
      end

      def generate_commands(recipient:, activity:, time: nil)
        notification = activity.item

        Rails.cache.fetch("campaigns/inappropriate_content_flagged/#{notification.inappropriate_content_flag_id}", expires_in: 5.minutes) do
          flag = notification.inappropriate_content_flag
          flaggable = flag.flaggable

          payload = {
            flaggable_author_name: UserDisplayNameService.new(AppConfiguration.instance, recipient).display_name!(flaggable.author),
            flaggable_type: flag.flaggable_type,
            flag_automatically_detected: flag.automatically_detected?,
            flaggable_url: Frontend::UrlService.new.model_to_url(flaggable, locale: Locale.new(recipient.locale))
          }

          case flag.flaggable_type
          when Idea.name
            payload[:flaggable_title_multiloc] = flaggable.title_multiloc
            payload[:flaggable_body_multiloc] = flaggable.body_multiloc
          when Comment.name
            payload[:flaggable_body_multiloc] = flaggable.body_multiloc
          else
            raise "Unsupported flaggable type: #{flag.flaggable_type}"
          end

          [{ event_payload: payload }]
        end
      end
    end
  end
end
