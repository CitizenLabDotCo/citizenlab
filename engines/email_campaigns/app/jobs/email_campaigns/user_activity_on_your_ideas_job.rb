module EmailCampaigns
  class UserActivityOnYourIdeasJob < ApplicationJob
    queue_as :default
  
    def perform last_scheduled_at=(Time.now - 7.days).to_i
      last_scheduled_at = Time.at(last_scheduled_at)
      # TODO
    end
  end
end
