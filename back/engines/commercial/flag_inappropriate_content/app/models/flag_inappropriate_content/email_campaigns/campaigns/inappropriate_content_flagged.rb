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
module FlagInappropriateContent
  module EmailCampaigns
    class Campaigns::InappropriateContentFlagged < ::EmailCampaigns::Campaign
      include ::EmailCampaigns::Consentable
      include ::EmailCampaigns::ActivityTriggerable
      include ::EmailCampaigns::Disableable
      include ::EmailCampaigns::Trackable
      include ::EmailCampaigns::LifecycleStageRestrictable

      allow_lifecycle_stages only: %w[trial active]

      recipient_filter :filter_notification_recipient

      def self.consentable_roles
        ['admin', 'project_moderator', 'project_folder_moderator']
      end
      
      def self.category
        'admin'
      end

      def mailer_class
        InappropriateContentFlaggedMailer
      end

      def activity_triggers
        { 'FlagInappropriateContent::Notifications::InappropriateContentFlagged' => { 'created' => true } }
      end

      def filter_notification_recipient users_scope, activity:, time: nil
        users_scope.where(id: activity.item.recipient_id)
      end

      def generate_commands recipient:, activity:, time: nil
        data = Rails.cache.fetch("campaigns/inappropriate_content_flagged/#{activity.item.inappropriate_content_flag_id}", expires_in: 5.minutes) do
          flag = activity.item.inappropriate_content_flag
          flaggable = flag.flaggable
          d = {
            flaggable_author: flaggable.author,
            flaggable: flaggable,
            flaggable_type: flag.flaggable_type
          }
          d
        end
        name_service = UserDisplayNameService.new AppConfiguration.instance, recipient
        notification = activity.item
        payload = {
          flaggable_type: data[:flaggable_type],
          flaggable_author_name: UserDisplayNameService.new(AppConfiguration.instance, recipient).display_name!(data[:flaggable_author]),
          flaggable_url: Frontend::UrlService.new.model_to_url(data[:flaggable], locale: recipient.locale)
        }
        case data[:flaggable_type]
        when Idea.name 
          payload[:flaggable_title_multiloc] = data[:flaggable].title_multiloc
          payload[:flaggable_body_multiloc] = data[:flaggable].body_multiloc
        when Initiative.name 
          payload[:flaggable_title_multiloc] = data[:flaggable].title_multiloc
          payload[:flaggable_body_multiloc] = data[:flaggable].body_multiloc
        when Comment.name 
          payload[:flaggable_body_multiloc] = data[:flaggable].body_multiloc
        end
        [{
          event_payload: payload
        }]
      end
    end
  end
end
