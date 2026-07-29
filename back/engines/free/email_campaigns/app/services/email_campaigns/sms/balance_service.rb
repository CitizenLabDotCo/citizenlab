# frozen_string_literal: true

module EmailCampaigns
  module Sms
    # Computes how many of the tenant's purchased SMS messages are left.
    #
    # There is no ledger: the balance is derived on the fly from the cumulative
    # `sms.messages_purchased` setting minus every SMS this platform has ever
    # handed to the provider (see Delivery::BILLABLE_STATUSES). That means
    # `messages_purchased` must be topped up cumulatively — selling a second
    # bundle means adding to the number, not overwriting it.
    class BalanceService
      # Sends not attributable to one of the two SMS campaign types — today only
      # previews/test sends, which are dispatched with `campaign_id: nil` but are
      # real, billed messages.
      OTHER_KEY = :used_other

      CAMPAIGN_TYPE_KEYS = {
        'EmailCampaigns::Campaigns::NewPhoneConfirmation' => :used_otp,
        'EmailCampaigns::Campaigns::SmsManual' => :used_manual
      }.freeze

      def initialize(app_configuration: AppConfiguration.instance)
        @app_configuration = app_configuration
      end

      def purchased
        @app_configuration.settings('sms', 'messages_purchased') || 0
      end

      # Billable sends, split by the campaign that triggered them.
      # @return [Hash{Symbol=>Integer}]
      def used_breakdown
        @used_breakdown ||= begin
          counts = CAMPAIGN_TYPE_KEYS.values.index_with(0).merge(OTHER_KEY => 0)
          counts_by_type.each do |type, count|
            counts[CAMPAIGN_TYPE_KEYS.fetch(type, OTHER_KEY)] += count
          end
          counts
        end
      end

      def used
        used_breakdown.values.sum
      end

      # May go negative once a tenant sends more than it bought — that is a real
      # (over-)usage figure and is reported as such rather than clamped to 0.
      def balance
        purchased - used
      end

      def to_h
        { purchased: purchased, used: used, balance: balance, **used_breakdown }
      end

      private

      # Unknown campaign types (and NULL campaign_id, for previews) fold into
      # OTHER_KEY, so the breakdown always sums to `used`.
      def counts_by_type
        Delivery.billable
          .left_joins(:campaign)
          .group('email_campaigns_campaigns.type')
          .count
      end
    end
  end
end
