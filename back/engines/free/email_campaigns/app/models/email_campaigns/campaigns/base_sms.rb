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

    def deliver_now(command)
      dispatch_sms(command, campaign_id: id, synchronous: true)
    end

    def deliver_later(command)
      dispatch_sms(command, campaign_id: id, synchronous: false)
    end

    # Like #deliver_later, but leaves the delivery unlinked so a preview/test send
    # doesn't count towards this campaign's deliveries/stats or sent? state.
    def deliver_preview(command)
      raise EmailCampaigns::Sms::Error, 'Recipient has no phone number' if sms_destination(command).blank?

      dispatch_sms(command, campaign_id: nil, synchronous: false)
    end

    def sms_body(_command)
      raise NotImplementedError, "#{self.class} must implement #sms_body"
    end

    # The phone number this campaign's SMS should be sent to.
    def sms_destination(_command)
      raise NotImplementedError, "#{self.class} must implement #sms_destination"
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
    # email. Under the verification flow phone is only populated once the
    # number is confirmed, so phone_confirmed_at is the authoritative guard.
    def recipients_base_scope
      User.where.not(phone_confirmed_at: nil)
    end

    private

    # All SMS sends go through Sms::SendJob. A synchronous send (perform_now, e.g.
    # the OTP) passes the destination explicitly because it may target a number
    # that isn't the recipient's confirmed `phone` yet (the pending new_phone).
    # An async send omits it and lets the job resolve the recipient's phone.
    def dispatch_sms(command, campaign_id:, synchronous:)
      destination = sms_destination(command)
      return if destination.blank? || sms_body(command).blank?

      delivery = EmailCampaigns::Sms::SendService.new.create_delivery(
        body: sms_body(command),
        user_id: command[:recipient].id,
        campaign_id: campaign_id
      )
      if synchronous
        EmailCampaigns::Sms::SendJob.perform_now(delivery.id, to: destination)
      else
        EmailCampaigns::Sms::SendJob.perform_later(delivery.id)
      end
      delivery
    end
  end
end
