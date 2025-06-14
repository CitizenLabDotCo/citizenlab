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
#  custom_text_multiloc :jsonb
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
  class Campaigns::VotingLastChance < Campaign
    include Consentable
    include ActivityTriggerable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_recipient

    def mailer_class
      VotingLastChanceMailer
    end

    def activity_triggers
      { 'Notifications::VotingLastChance' => { 'created' => true } }
    end

    def filter_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.users_who_engaged_but_not_voted'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.voting'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.voting_2_days_before_phase_closes'
    end

    def generate_commands(recipient:, activity:)
      project = activity.item.project
      phase = activity.item.phase
      [{
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(project, locale: Locale.new(recipient.locale)),
          phase_title_multiloc: phase.title_multiloc,
          project_title_multiloc: project.title_multiloc
        }
      }]
    end
  end
end
