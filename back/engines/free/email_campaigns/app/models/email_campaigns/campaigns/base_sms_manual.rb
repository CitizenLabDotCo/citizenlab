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
  # Manual SMS campaign. Reuses the channel-agnostic campaign orchestration
  # (recipient filtering, manual-send pipeline, scheduling) but delivers over SMS.
  #
  # Notably it does NOT include Trackable (which writes the email delivery table)
  # nor ContentConfigurable/SenderConfigurable (email subject/sender/reply_to).
  # Delivery records are Sms::Delivery rows written by the SMS transport layer,
  # linked back via the polymorphic `source` association.
  class Campaigns::BaseSmsManual < Campaign
    include SmsConsentable
    include SmsContentConfigurable
    include RecipientConfigurable
    include LifecycleStageRestrictable

    # Without this, the campaign would be sent on every event and every schedule trigger.
    filter :only_manual_send

    has_many :sms_deliveries, class_name: 'Sms::Delivery', as: :source, dependent: :nullify

    validate :scheduled_at_in_future, if: -> { scheduled_at.present? && schedule_changed? }

    def delivery_channel
      :sms
    end

    def manual?
      true
    end

    def can_be_disabled?
      false
    end

    # SMS can only target users with a verified phone number.
    def recipient_base_scope
      User.where.not(phone_number: nil).where.not(phone_number_verified_at: nil)
    end

    def sent?
      # SMS deliveries are written asynchronously by the transport layer, so this
      # becomes true shortly after a send rather than synchronously.
      sms_deliveries.exists?
    end

    def generate_commands(recipient:, time: nil, activity: nil)
      [{
        event_payload: {},
        body: sms_body(recipient.locale)
      }]
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    # --- One-time scheduling (mirrors Campaigns::BaseManual) ---

    def scheduled_at
      return nil if schedule.blank?

      ic_schedule.rtimes.first
    end

    def scheduled_at=(datetime)
      if datetime.present?
        time = datetime.is_a?(String) ? Time.zone.parse(datetime) : datetime
        ics = IceCube::Schedule.new(time)
        ics.add_recurrence_time(time)
        self.ic_schedule = ics
      else
        self.schedule = nil
      end
    end

    def ic_schedule
      return nil if schedule.blank?

      IceCube::Schedule.from_hash(schedule)
    end

    def ic_schedule=(ics)
      self.schedule = ics&.to_hash
    end

    def clear_scheduled_at!
      update!(schedule: nil)
    end

    protected

    def unique_campaigns_per_context?
      false
    end

    private

    def only_manual_send(activity: nil, time: nil)
      !activity && !time
    end

    def scheduled_at_in_future
      errors.add(:scheduled_at, :in_the_past) if scheduled_at <= Time.now
    end
  end
end
