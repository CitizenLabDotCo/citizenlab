module EmailCampaigns
  module Disableable
    extend ActiveSupport::Concern

    # If one instance is enabled, we consider the campaign_type enabled. This
    # returns all campaign_types that are not all disabled
    def self.enabled_campaign_types instances
      disabled_types, enabled_types = instances
        .partition{|campaign| campaign.respond_to?(:filter_enabled?) && !campaign.filter_enabled?}
        .map{|partition| partition.map(&:type)}
      disabled_types - enabled_types
    end

    included do
      validates :enabled, inclusion: { in: [true, false]}

      before_send :filter_enabled?
    end

    def filter_enabled? options={}
      self.enabled != false
    end

  end
end
