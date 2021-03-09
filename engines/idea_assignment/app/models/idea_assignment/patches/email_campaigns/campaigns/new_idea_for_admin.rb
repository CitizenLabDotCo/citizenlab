module IdeaAssignment
  module Patches
    module EmailCampaigns
      module Campaigns
        module NewIdeaForAdmin
          def filter_recipient(recipient:, activity:, time: nil)
            idea = activity.item

            super - [idea&.assignee_id]
          end
        end
      end
    end
  end
end
