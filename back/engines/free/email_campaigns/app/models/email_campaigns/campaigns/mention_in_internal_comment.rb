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
#  project_id       :uuid
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id   (author_id)
#  index_email_campaigns_campaigns_on_project_id  (project_id)
#  index_email_campaigns_campaigns_on_type        (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#  fk_rails_...  (project_id => projects.id)
#
module EmailCampaigns
  class Campaigns::MentionInInternalComment < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_notification_recipient

    def activity_triggers
      { 'Notifications::InternalComments::MentionInInternalComment' => { 'created' => true } }
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
      'email_campaigns.admin_labels.recipient_segment.user_who_is_mentioned'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.internal_comments'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.user_is_mentioned_in_internal_comment'
    end

    def mailer_class
      MentionInInternalCommentMailer
    end

    def generate_commands(recipient:, activity:, time: nil)
      InternalCommentCampaignCommandsBuilder.new.build_commands(recipient, activity)
    end
  end
end
