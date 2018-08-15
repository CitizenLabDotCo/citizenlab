module EmailCampaigns
  module Disableable
    extend ActiveSupport::Concern

    included do
      validates :enabled, inclusion: { in: [true, false]}
      
      add_send_filter :filter_enabled
    end

    def filter_enabled
      self.enabled == false ? false : true
    end

  end
end