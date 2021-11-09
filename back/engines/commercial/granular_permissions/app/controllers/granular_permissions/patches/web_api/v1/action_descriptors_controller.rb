# frozen_string_literal: true

module GranularPermissions
  module Patches
    module WebApi
      module V1
        module ActionDescriptorsController
          def initiatives
            ps = PermissionsService.new
            posting_disabled_reason = ps.denied_reason(current_user, 'posting_initiative')
            commenting_disabled_reason = ps.denied_reason(current_user, 'commenting_initiative')
            voting_disabled_reason = ps.denied_reason(current_user, 'voting_initiative')

            descriptors = {
              posting_initiative: { disabled_reason: posting_disabled_reason },
              commenting_initiative: { disabled_reason: commenting_disabled_reason },
              voting_initiative: { disabled_reason: voting_disabled_reason }
            }

            descriptors.each { |_, desc| desc[:enabled] = !desc[:disabled_reason] }
            descriptors[:comment_voting_initiative] = descriptors[:commenting_initiative]
            descriptors[:cancelling_initiative_votes] = descriptors[:voting_initiative]

            render(json: descriptors)
          end
        end
      end
    end
  end
end
