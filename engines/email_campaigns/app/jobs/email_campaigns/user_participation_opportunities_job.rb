module EmailCampaigns
  class UserParticipationOpportunitiesJob < ApplicationJob
    queue_as :default
  
    def perform last_scheduled_at=(Time.now - 7.days)
      # TODO
    end
  end
end
