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
  class Campaigns::ProjectFolderModerationRightsReceived < ::EmailCampaigns::Campaign
    include ::EmailCampaigns::ActivityTriggerable
    include ::EmailCampaigns::RecipientConfigurable
    include ::EmailCampaigns::Disableable
    include ::EmailCampaigns::Trackable
    include ::EmailCampaigns::LifecycleStageRestrictable

    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_notification_recipient

    delegate :admin_project_folder_url, to: :url_service

    def mailer_class
      ProjectFolders::EmailCampaigns::ProjectFolderModerationRightsReceivedMailer
    end

    def activity_triggers
      { 'Notifications::ProjectFolderModerationRightsReceived' => { 'created' => true } }
    end

    def filter_notification_recipient(users_scope, activity:, **_unused_options)
      users_scope.where(id: activity.item.id)
    end

    def generate_commands(recipient:, activity:, **_unused_options)
      folder = ProjectFolders::Folder.find(activity.payload['project_folder_id'])
      [{
        event_payload: {
          project_folder_id: folder.id,
          project_folder_title_multiloc: folder.title_multiloc,
          project_folder_projects_count: folder.projects.count,
          project_folder_url: admin_project_folder_url(folder.id, locale: recipient.locale)
        }
      }]
    end

    def url_service
      @url_service ||= Frontend::UrlService.new
    end
  end
end
