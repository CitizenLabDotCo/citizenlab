# frozen_string_literal: true

module EmailCampaigns
  module Extensions
    module Project
      def self.included(base)
        base.has_many :campaigns, class_name: 'EmailCampaigns::Campaign', dependent: :destroy
      end
    end
  end
end
