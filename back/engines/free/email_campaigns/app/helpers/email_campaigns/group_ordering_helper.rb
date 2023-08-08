# frozen_string_literal: true

module EmailCampaigns
  module GroupOrderingHelper
    RECIPIENT_ROLE_ORDER = %w[registered_users admins_and_managers admins managers]
    CONTENT_TYPES_ORDER = %w[general permissions inputs comments voting reactions proposals projects content_moderation]

    def group_ordering(group_type, key)
      if group_type == 'recipient_role'
        RECIPIENT_ROLE_ORDER.index(key)
      elsif group_type == 'content_type'
        CONTENT_TYPES_ORDER.index(key)
      else
        raise "Unknown group type #{group_type}"
      end
    end
  end
end
