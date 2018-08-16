module EmailCampaigns
  module Disableable
    extend ActiveSupport::Concern

    included do
      validates :enabled, inclusion: { in: [true, false]}
      
      before_send :filter_enabled
    end

    def filter_enabled options={}
      self.enabled == false ? false : true
    end

  end
end