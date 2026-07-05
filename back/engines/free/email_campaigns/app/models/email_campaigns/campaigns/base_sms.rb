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
  # Base class for all SMS-channel campaigns. Concrete subclasses (e.g. the
  # manual SMS campaign, and later a phone-confirmation OTP campaign) inherit
  # from this.
  class Campaigns::BaseSms < Campaign
    # SMS campaigns track their sends through EmailCampaigns::Sms::Delivery (linked by
    # campaign_id)
    has_many :sms_deliveries, class_name: 'EmailCampaigns::Sms::Delivery', foreign_key: :campaign_id, dependent: :nullify, inverse_of: :campaign

    def self.channel
      'sms'
    end

    # The SMS-channel analog of #mailer_class: the texter that renders this
    # campaign's body and resolves its destination number. Concrete SMS
    # campaigns must point at their own texter.
    def texter_class
      raise NotImplementedError, "#{self.class} must define #texter_class"
    end

    def sent?
      sms_deliveries.exists?
    end

    # Email campaigns keep a counter-culture `deliveries_count` column; SMS
    # campaigns track their sends in a separate table, so count those instead.
    def deliveries_count
      sms_deliveries.count
    end

    protected

    # SMS recipients are seeded from users with a *confirmed* phone number, not an
    # email. Under the verification flow phone_number is only populated once the
    # number is confirmed, so phone_number_confirmed_at is the authoritative guard.
    def recipients_base_scope
      User.where.not(phone_number_confirmed_at: nil)
    end
  end
end
