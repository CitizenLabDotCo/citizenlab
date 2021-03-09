module IdeaAssignment
  module Patches
    module EmailCampaigns
      module Campaigns
        module NewIdeaForAdmin
          def filter_recipient(*args)
            super - [idea&.assignee_id]
          end
        end
      end
    end
  end
end
