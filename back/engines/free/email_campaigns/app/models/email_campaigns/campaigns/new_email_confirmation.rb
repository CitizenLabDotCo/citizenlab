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
#  context_type         :string
#  channel              :string           default("email"), not null
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
  class Campaigns::NewEmailConfirmation < Campaign
    include Trackable
    include ContentConfigurable

    # Sent synchronously when a user requests a code to confirm a new email
    # address (see RequestNewEmailConfirmationCodeJob). Like EmailConfirmation,
    # it is a mandatory transactional email and is always sent.
    #
    # It is delivered directly via DeliveryService#send_now_to_user and never
    # through the scheduled/activity pipeline, so this filter keeps it out of
    # that pipeline (send_on_schedule / send_on_activity).
    filter :exclude_from_send_pipeline

    def mailer_class
      NewEmailConfirmationMailer
    end

    def exclude_from_send_pipeline(activity: nil, time: nil)
      false
    end

    def can_be_disabled?
      false
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.user_changing_email'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.user_changes_email'
    end
  end
end
