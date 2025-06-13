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
  class Campaigns::YourInputInScreening < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_input_author
    before_send :status_is_prescreening?

    def mailer_class
      YourInputInScreeningMailer
    end

    def activity_triggers
      { 'Idea' => { 'submitted' => true } }
    end

    def filter_input_author(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.author_id)
    end

    def status_is_prescreening?(activity:, time: nil)
      activity.item&.idea_status&.code == 'prescreening'
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.user_who_submitted_the_input'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.inputs'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.new_input_awaits_screening'
    end

    def generate_commands(recipient:, activity:)
      idea = activity.item
      status = idea.idea_status
      [{
        event_payload: {
          input_id: idea.id,
          input_title_multiloc: idea.title_multiloc,
          input_body_multiloc: idea.body_multiloc,
          input_url: Frontend::UrlService.new.model_to_url(idea, locale: Locale.new(recipient.locale)),
          prescreening_status_title_multiloc: status.title_multiloc,
          prescreening_status_description_multiloc: status.description_multiloc,
          input_term: idea.input_term
        }
      }]
    end
  end
end
