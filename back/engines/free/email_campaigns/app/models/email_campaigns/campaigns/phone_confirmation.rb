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
  # Transactional SMS one-time-password campaign for phone-number verification.
  # Unlike the manual SMS campaign, it is never broadcast through the send
  # pipeline (activity / schedule / manual send): it is sent one recipient at a
  # time from RequestNewPhoneConfirmationCodeJob via EmailCampaigns::Sms::SendService, and this campaign
  # only provides the localized body template and the delivery tracking link.
  class Campaigns::PhoneConfirmation < Campaigns::BaseSms
    # Belt-and-suspenders: block every pipeline send. The OTP is dispatched
    # directly, so this filter never gets in the way of an actual send.
    filter :never_via_pipeline

    # The body is rendered here (not from a DB column) with the code interpolated,
    # then translated to the recipient's locale by the delivery layer.
    def generate_commands(recipient:, code:)
      [{
        author: author,
        event_payload: { code: code },
        body_multiloc: {
          recipient.locale => I18n.t(
            'email_campaigns.phone_confirmation.sms_body',
            code: code,
            locale: recipient.locale
          )
        }
      }]
    end

    def can_be_disabled?
      false
    end

    # Internal/transactional: keep it out of the admin campaigns list.
    def hidden_from_admin?
      true
    end

    private

    def never_via_pipeline(activity: nil, time: nil)
      false
    end
  end
end
