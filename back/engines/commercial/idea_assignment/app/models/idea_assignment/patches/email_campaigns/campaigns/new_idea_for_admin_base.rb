# frozen_string_literal: true

module IdeaAssignment
  module Patches
    module EmailCampaigns
      module Campaigns
        module NewIdeaForAdminBase
          def filter_recipient(users_scope, activity:, time: nil)
            idea = activity.item

            super - [idea&.assignee_id]
          end
        end
      end
    end
  end
end
