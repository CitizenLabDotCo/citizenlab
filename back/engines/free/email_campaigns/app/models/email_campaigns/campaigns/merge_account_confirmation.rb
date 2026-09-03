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
  class Campaigns::MergeAccountConfirmation < Campaign
    include Trackable
    include ContentConfigurable

    # Sent synchronously when someone signed in through an email-less SSO method
    # supplies an email address that already belongs to another account, and asks
    # for that account to absorb their sign-in (see
    # RequestMergeAccountConfirmationCodeJob).
    #
    # The recipient of the campaign is the SSO account, but the mail is delivered to
    # the *other* account's inbox - entering the code is what proves the two are the
    # same person. Mandatory and transactional, like its NewEmailConfirmation
    # sibling, so it never goes through the scheduled/activity pipeline.
    filter :exclude_from_send_pipeline

    def mailer_class
      MergeAccountConfirmationMailer
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
