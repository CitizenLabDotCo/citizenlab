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
  class Campaigns::SmsManual < Campaigns::BaseSms
    include Consentable
    include RecipientConfigurable
    include LifecycleStageRestrictable

    allow_lifecycle_stages except: %w[trial churned]

    recipient_filter :user_filter_no_invitees

    filter :only_manual_send

    # The admin a preview goes out to, which decides the locale it is billed in.
    attr_accessor :previewer

    validates :subject_multiloc, presence: true, multiloc: { presence: true }
    validates :body_multiloc, presence: true, multiloc: { presence: true }
    validate :body_within_segment_limit
    validate :validate_sms_provider_configured, on: %i[send preview]
    validate :validate_sufficient_balance, on: :send
    validate :validate_sufficient_preview_balance, on: :preview

    def self.sms_use_case
      Sms::UseCase::MANUAL_CAMPAIGNS
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    # SMS Campaigns should be opt-in.
    def self.consented_by_default?
      false
    end

    # The admin-authored body, carried on the command by #generate_commands.
    def sms_body(command)
      MultilocService.new.t(command[:body_multiloc], command[:recipient].locale)
    end

    def sms_destination(command)
      command[:recipient].phone
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

    # Memoized: the filters behind it instantiate every group member and consent row.
    def recipients_count_by_locale
      @recipients_count_by_locale ||= apply_recipient_filters.group(:locale).count
    end

    def recipients_count
      recipients_count_by_locale.values.sum
    end

    # What a send costs in segments: each recipient is billed for the body in their own locale
    def segments_for_send
      multiloc_service = MultilocService.new
      recipients_count_by_locale.sum do |locale, count|
        body = multiloc_service.t(body_multiloc, locale).to_s
        count * EmailCampaigns::Sms::SegmentedMessage.new(body).segments_count
      end
    end

    # What a preview costs: one message, in the locale of the admin sending it to themselves.
    def segments_for_preview
      body = MultilocService.new.t(body_multiloc, previewer&.locale).to_s
      EmailCampaigns::Sms::SegmentedMessage.new(body).segments_count
    end

    protected

    def unique_campaigns_per_context?
      false
    end

    private

    # Each locale is sent as its own message, so each is capped on its own. A
    # character cap would not do: the limit is in segments, which depend on encoding.
    def body_within_segment_limit
      return unless body_multiloc.is_a?(Hash)

      max_segments = EmailCampaigns::Sms::SegmentedMessage::MAX_SEGMENTS
      body_multiloc.each do |locale, body|
        next unless body.is_a?(String) && EmailCampaigns::Sms::SegmentedMessage.new(body).exceeds_limit?

        errors.add(:body_multiloc, :too_many_segments, message: "#{locale}: exceeds #{max_segments} SMS segments")
      end
    end

    def user_filter_no_invitees(users_scope, _options = {})
      users_scope.active
    end

    # Caught here rather than in the job, so an unconfigured tenant gets one error on
    # send instead of a delivery per recipient that can only fail.
    def validate_sms_provider_configured
      return if EmailCampaigns::Sms::SendService.new.configured?(self.class.sms_use_case)

      errors.add(:base, :sms_not_configured, message: 'Some of the SMS configuration is missing')
    end

    def validate_sufficient_balance
      return if segments_for_send <= EmailCampaigns::Sms::BalanceService.new.balance

      errors.add(:base, :insufficient_sms_balance, message: 'Not enough SMS segments left to reach all recipients')
    end

    # A preview is a real, billed message, so it is refused once the balance no longer covers it.
    def validate_sufficient_preview_balance
      return if segments_for_preview <= EmailCampaigns::Sms::BalanceService.new.balance

      errors.add(:base, :insufficient_sms_balance, message: 'Not enough SMS segments left to send a preview')
    end

    def only_manual_send(activity: nil, time: nil)
      !activity && !time
    end
  end
end
