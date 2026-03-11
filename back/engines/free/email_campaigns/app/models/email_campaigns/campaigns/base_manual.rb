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
  class Campaigns::BaseManual < Campaign
    include Consentable
    include ContentConfigurable
    include SenderConfigurable
    include RecipientConfigurable
    include Trackable
    include Schedulable
    include LifecycleStageRestrictable

    # Without this, the campaign would be sent on every event and every schedule trigger.
    filter :only_manual_send

    validate :scheduled_at_in_future, if: -> { scheduled_at.present? && schedule_changed? }

    def self.default_schedule
      IceCube::Schedule.new(Time.current)
    end

    # Virtual getter: extract scheduled datetime from IceCube rtimes
    def scheduled_at
      return nil if schedule.blank?
      return nil if ic_schedule.rtimes.empty?

      ic_schedule.rtimes.first
    end

    # Virtual setter: convert datetime to IceCube one-time schedule
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

    def schedule_optional?
      true
    end

    def mailer_class
      ManualCampaignMailer
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    def generate_commands(recipient:, time: nil, activity: nil)
      [{
        author: author,
        event_payload: {},
        subject_multiloc: subject_multiloc,
        body_multiloc: TextImageService.new.render_data_images_multiloc(body_multiloc, field: :body_multiloc, imageable: self),
        sender: sender,
        reply_to: reply_to
      }]
    end

    def manual?
      true
    end

    def can_be_disabled?
      false
    end

    def clear_scheduled_at
      return if scheduled_at.blank?

      self.schedule = nil
      save!
    end

    # Override Schedulable's filter to allow send_now (time is nil for manual triggers)
    def filter_campaign_scheduled(time:, activity: nil)
      return true unless time              # Allow send_now
      return false unless scheduled_at     # No schedule = not eligible for cron

      super
    end

    protected

    def unique_campaigns_per_context?
      false
    end

    private

    def only_manual_send(activity: nil, time: nil)
      return false if activity  # Never send on activity
      return true unless time   # Allow send_now

      !sent?                    # Prevent re-sending via cron
    end

    def scheduled_at_in_future
      errors.add(:scheduled_at, :in_the_past) if scheduled_at <= Time.zone.now
    end
  end
end
