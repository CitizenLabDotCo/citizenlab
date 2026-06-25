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
  # Base class for all SMS-channel campaigns. Concrete subclasses (e.g. the
  # manual SMS campaign, and later a phone-confirmation OTP campaign) inherit
  # from this.
  class Campaigns::BaseSms < Campaign
    # SMS campaigns track their sends through EmailCampaigns::Sms::Delivery (linked by
    # campaign_id)
    has_many :sms_deliveries, class_name: 'EmailCampaigns::Sms::Delivery', foreign_key: :campaign_id, dependent: :nullify, inverse_of: :campaign

    def channel
      :sms
    end

    def sent?
      sms_deliveries.exists?
    end

    protected

    # SMS recipients are seeded from users with a phone number, not an email.
    def recipients_base_scope
      User.where.not(phone_number: nil)
    end
  end
end
