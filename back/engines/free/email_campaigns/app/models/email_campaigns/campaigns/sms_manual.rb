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
  # First concrete SMS campaign: an admin writes a short text and sends it on
  # demand. Mirrors the manual email campaign, minus the email-only pieces
  # (HTML body, sender/reply_to, mailer) and minus scheduling. The subject_multiloc
  # column is reused to hold an internal admin label (SMS has no subject line).
  class Campaigns::SmsManual < Campaigns::BaseSms
    include Consentable
    include RecipientConfigurable
    include LifecycleStageRestrictable

    allow_lifecycle_stages except: %w[trial churned]

    recipient_filter :user_filter_no_invitees

    # Without this, the campaign would be sent on every event and every schedule
    # trigger. It should only be sent through an explicit manual send.
    filter :only_manual_send

    # subject_multiloc is reused as the admin-facing label so campaigns are easy
    # to tell apart in the list (not sent to recipients; SMS has no subject line).
    # SMS body is a single plain-text multiloc.
    validates :subject_multiloc, presence: true, multiloc: { presence: true }
    validates :body_multiloc, presence: true, multiloc: { presence: true }

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    def generate_commands(recipient:, time: nil, activity: nil)
      [{
        author: author,
        event_payload: {},
        body_multiloc: body_multiloc
      }]
    end

    def manual?
      true
    end

    def can_be_disabled?
      false
    end

    # No scheduling yet, but the manual send flow and serializer expect these.
    def scheduled_at
      nil
    end

    def clear_scheduled_at!; end

    protected

    def unique_campaigns_per_context?
      false
    end

    private

    def user_filter_no_invitees(users_scope, _options = {})
      users_scope.active
    end

    def only_manual_send(activity: nil, time: nil)
      !activity && !time
    end
  end
end
