# frozen_string_literal: true

module Permissions
  class InitiativePermissionsService < BasePermissionsService
    def action_descriptors(user)
      # TODO: JS - nothing here about reacting being enabled or not?? Is that possible, have we missed some code?
      posting_disabled_reason = denied_reason_for_action 'posting_initiative', user
      commenting_disabled_reason = denied_reason_for_action 'commenting_initiative', user
      reacting_disabled_reason = denied_reason_for_action 'reacting_initiative', user

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
