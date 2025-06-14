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
  class Campaigns::SurveySubmitted < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_recipient

    def mailer_class
      SurveySubmittedMailer
    end

    def activity_triggers
      { 'Idea' => { 'published' => true } }
    end

    def filter_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.author_id)
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.user_who_published_the_input'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.inputs'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.input_is_published'
    end

    def generate_commands(recipient:, activity:)
      idea = activity.item
      return [] if idea.participation_method_on_creation.supports_public_visibility?

      project = idea.project

      [{
        event_payload: {
          idea_id: idea.id,
          project_title_multiloc: project.title_multiloc,
          profile_url: Frontend::UrlService.new.profile_surveys_url(recipient.slug),
          has_password: !recipient.no_password?
        }
      }]
    end
  end
end
