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
  class Campaigns::NewCommentForAdmin < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_recipient

    def activity_triggers
      { 'Comment' => { 'created' => true } }
    end

    def self.consentable_roles
      %w[admin project_moderator]
    end

    def filter_recipient(users_scope, activity:, time: nil)
      comment = activity.item
      initiator = comment.author

      recipient_ids = []
      unless initiator&.admin?
        recipients = User.admin
        if !initiator.project_moderator?(comment.idea.project_id)
          recipient_ids = recipients.or(User.project_moderator(comment.idea.project_id)).ids
        end
      end

      users_scope.where(id: recipient_ids)
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins_and_managers'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.admins_and_managers'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.comments'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.user_comments'
    end

    def mailer_class
      NewCommentForAdminMailer
    end

    def generate_commands(recipient:, activity:, time: nil)
      comment = activity.item
      idea = comment.idea
      [{
        event_payload: {
          initiating_user_first_name: comment.author&.first_name,
          initiating_user_last_name: comment.author&.last_name,
          comment_author_name: comment.author_name,
          comment_body_multiloc: comment.body_multiloc,
          comment_url: Frontend::UrlService.new.model_to_url(comment, locale: Locale.new(recipient.locale)),
          idea_published_at: idea.published_at.iso8601,
          idea_title_multiloc: idea.title_multiloc,
          idea_author_name: idea.author_name
        }
      }]
    end

    protected

    def set_enabled
      self.enabled = false if enabled.nil?
    end
  end
end
