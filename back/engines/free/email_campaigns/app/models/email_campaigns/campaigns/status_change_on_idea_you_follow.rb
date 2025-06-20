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
  class Campaigns::StatusChangeOnIdeaYouFollow < Campaign
    include Consentable
    include Disableable
    include ActivityTriggerable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_notification_recipient

    def mailer_class
      StatusChangeOnIdeaYouFollowMailer
    end

    def activity_triggers
      { 'Notifications::StatusChangeOnIdeaYouFollow' => { 'created' => true } }
    end

    def filter_notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient_id)
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.users_who_follow_the_input'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.inputs'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.input_status_changes'
    end

    def generate_commands(recipient:, activity:)
      idea = activity.item.idea
      status = idea.idea_status
      [{
        event_payload: {
          idea_title_multiloc: idea.title_multiloc,
          idea_url: Frontend::UrlService.new.model_to_url(idea, locale: Locale.new(recipient.locale)),
          idea_status_title_multiloc: status.title_multiloc,
          unfollow_url: Frontend::UrlService.new.unfollow_url(Follower.new(followable: idea, user: recipient))
        }
      }]
    end
  end
end
