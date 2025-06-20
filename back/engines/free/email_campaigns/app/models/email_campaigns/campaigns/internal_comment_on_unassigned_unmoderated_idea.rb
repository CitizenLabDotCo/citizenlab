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
module EmailCampaigns
  class Campaigns::InternalCommentOnUnassignedUnmoderatedIdea < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_notification_recipient

    def activity_triggers
      { 'Notifications::InternalComments::InternalCommentOnUnassignedUnmoderatedIdea' => { 'created' => true } }
    end

    def filter_notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.consentable_roles
      %w[admin]
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.admins'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.internal_comments'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.internal_comment_is_posted_on_unassigned_unmoderated_idea'
    end

    def mailer_class
      InternalCommentOnUnassignedUnmoderatedIdeaMailer
    end

    def generate_commands(recipient:, activity:, time: nil)
      InternalCommentCampaignCommandsBuilder.new.build_commands(recipient, activity)
    end
  end
end
