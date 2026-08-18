# frozen_string_literal: true

module EmailCampaigns
  module Sms
    # Computes how much of the tenant's purchased SMS allowance is left, counted in
    # segments — the unit the provider bills. The `messages_purchased` setting holds
    # the purchased allowance in those same units.
    class BalanceService
      # Sends not attributable to one of the SMS campaign types — today only
      # previews/test sends, which are dispatched with `campaign_id: nil` but are
      # real, billed messages.
      OTHER_KEY = :used_other

      BILLABLE_CAMPAIGN_TYPE_KEYS = {
        'EmailCampaigns::Campaigns::SmsManual' => :used_manual
      }.freeze

      NON_BILLABLE_CAMPAIGN_TYPES = %w[
        EmailCampaigns::Campaigns::PhoneConfirmation
        EmailCampaigns::Campaigns::NewPhoneConfirmation
      ].freeze

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
          counts = BILLABLE_CAMPAIGN_TYPE_KEYS.values.index_with(0).merge(OTHER_KEY => 0)
          counts_by_type.each do |type, count|
            counts[BILLABLE_CAMPAIGN_TYPE_KEYS.fetch(type, OTHER_KEY)] += count
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
      # OTHER_KEY, so every billable send lands in exactly one breakdown key.
      #
      # The provider bills per segment, so a long message consumes several. Rows
      # predating the column carry no count and add nothing.
      #
      # The absorbed types are dropped here rather than in SQL, where excluding them
      # would take the NULL-campaign previews down with them.
      def counts_by_type
        Delivery.billable
          .left_joins(:campaign)
          .group('email_campaigns_campaigns.type')
          .sum(:segments_count)
          .except(*NON_BILLABLE_CAMPAIGN_TYPES)
      end
    end
  end
end
