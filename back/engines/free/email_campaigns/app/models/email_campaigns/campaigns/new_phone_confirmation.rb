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
  class Campaigns::NewPhoneConfirmation < Campaigns::BaseSms
    filter :exclude_from_send_pipeline

    # Renders the OTP message body in the recipient's locale, with the code
    # interpolated. SMS has no mailer, so the campaign produces its own body
    # (the email side renders via a mailer instead).
    def sms_body(recipient, code:)
      I18n.t('email_campaigns.new_phone_confirmation.sms_body', code: code, locale: recipient.locale)
    end

    def can_be_disabled?
      false
    end

    # Internal/transactional: keep it out of the admin campaigns list.
    def hidden_from_admin?
      true
    end

    private

    def exclude_from_send_pipeline(activity: nil, time: nil)
      false
    end
  end
end
