# frozen_string_literal: true

module Permissions
  class InitiativePermissionsService < BasePermissionsService
    def denied_reason_for_initiative(action)
      permission = find_permission(action)
      user_denied_reason(permission)
    end

    def action_descriptors
      posting_disabled_reason = denied_reason_for_initiative 'posting_initiative'
      commenting_disabled_reason = denied_reason_for_initiative 'commenting_initiative'
      reacting_disabled_reason = denied_reason_for_initiative 'reacting_initiative'

      descriptors = {
        posting_initiative: { disabled_reason: posting_disabled_reason },
        commenting_initiative: { disabled_reason: commenting_disabled_reason },
        reacting_initiative: { disabled_reason: reacting_disabled_reason }
      }

      descriptors.each { |_, desc| desc[:enabled] = !desc[:disabled_reason] }
      descriptors[:comment_reacting_initiative] = descriptors[:commenting_initiative]
      descriptors[:cancelling_initiative_reactions] = descriptors[:reacting_initiative]
      descriptors
    end
  end
end
