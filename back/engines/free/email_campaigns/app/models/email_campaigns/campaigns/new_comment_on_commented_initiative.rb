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
  class Campaigns::NewCommentOnCommentedInitiative < Campaign
    include ActivityTriggerable
    include Consentable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_recipient

    def mailer_class
      NewCommentOnCommentedInitiativeMailer
    end

    def activity_triggers
      { 'Comment' => { 'created' => true } }
    end

    def filter_recipient(users_scope, activity:, time: nil)
      users_scope = users_scope
        .where(id: activity.item.post.comments.pluck(:author_id))
        .where.not(id: activity.item.author_id)
        .where.not(id: activity.item.post.author_id)
      if activity.item.parent
        users_scope = users_scope
          .where.not(id: activity.item.parent.author_id)
      end
      users_scope
    end

    def self.category
      'commented'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.users_engaged_with_the_proposal'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.comments'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.user_comments'
    end

    def generate_commands(recipient:, activity:, time: nil)
      comment = activity.item
      return [] if comment.post_type != 'Initiative'

      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      [{
        event_payload: {
          initiating_user_first_name: comment.author&.first_name,
          initiating_user_last_name: name_service.last_name!(comment.author),
          post_published_at: comment.post.published_at.iso8601,
          post_title_multiloc: comment.post.title_multiloc,
          comment_body_multiloc: comment.body_multiloc,
          comment_url: Frontend::UrlService.new.model_to_url(comment, locale: recipient.locale)
        }
      }]
    end
  end
end
