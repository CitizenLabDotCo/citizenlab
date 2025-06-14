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
  class Campaigns::EventRegistrationConfirmation < Campaign
    include Consentable
    include Disableable
    include ActivityTriggerable
    include Trackable

    recipient_filter :attendant

    def mailer_class
      EventRegistrationConfirmationMailer
    end

    def activity_triggers
      { 'Events::Attendance' => { 'created' => true } }
    end

    def attendant(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.attendee_id)
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.new_attendee'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.registration_to_event'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.events'
    end

    def generate_commands(recipient:, activity:, time: nil)
      attendance = activity.item
      event = attendance.event
      project = event.project

      locale = Locale.new(recipient.locale)
      frontend_service = Frontend::UrlService.new
      event_url = frontend_service.model_to_url(event, locale: locale)
      project_url = frontend_service.model_to_url(project, locale: locale)

      [
        {
          event_payload: {
            event_attributes: event.attributes,
            event_url: event_url,
            project_title_multiloc: project.title_multiloc,
            project_url: project_url,
            image_url: project.header_bg.url
          }
        }
      ]
    end
  end
end
