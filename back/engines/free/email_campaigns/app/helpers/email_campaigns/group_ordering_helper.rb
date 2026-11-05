# frozen_string_literal: true

module EmailCampaigns
  module GroupOrderingHelper
    RECIPIENT_ROLE_ORDER = %w[registered_users admins_and_managers admins managers]
    CONTENT_TYPES_ORDER = %w[general permissions inputs comments voting reactions proposals projects content_moderation]

    # Explicit display order for campaigns within a content-type group on the
    # admin "Automated emails" page. Campaigns not listed here sort after the
    # listed ones, keeping their default (most-recent-first) order amongst
    # themselves.
    CAMPAIGN_ORDER = %w[
      user_digest
      welcome
      email_confirmation
      new_email_confirmation
      password_reset
      invite_received
      invite_reminder
      user_blocked
    ]

    def group_ordering(group_type, key)
      if group_type == 'recipient_role'
        RECIPIENT_ROLE_ORDER.index(key)
      elsif group_type == 'content_type'
        CONTENT_TYPES_ORDER.index(key)
      else
        raise "Unknown group type #{group_type}"
      end
    end

    def campaign_ordering(campaign_name)
      CAMPAIGN_ORDER.index(campaign_name) || CAMPAIGN_ORDER.length
    end
  end
end
