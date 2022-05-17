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
        if comment.post_type == 'Idea' && !initiator.project_moderator?(comment.post.project.id)
          recipient_ids = recipients.or(User.project_moderator(comment.post.project.id)).ids
        elsif comment.post_type == 'Initiative'
          recipient_ids = recipients.ids
        end
      end

      users_scope.where(id: recipient_ids)
    end

    def self.category
      'admin'
    end

    def mailer_class
      NewCommentForAdminMailer
    end

    def generate_commands(recipient:, activity:, time: nil)
      comment = activity.item
      post = comment.post
      [{
        event_payload: {
          initiating_user_first_name: comment.author&.first_name,
          initiating_user_last_name: comment.author&.last_name,
          comment_author_name: comment.author_name,
          comment_body_multiloc: comment.body_multiloc,
          comment_url: Frontend::UrlService.new.model_to_url(comment, locale: recipient.locale),
          post_published_at: post.published_at.iso8601,
          post_title_multiloc: post.title_multiloc,
          post_author_name: post.author_name,
          post_type: comment.post_type
        }
      }]
    end

    protected

    def set_enabled
      self.enabled = false if enabled.nil?
    end
  end
end
