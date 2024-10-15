# frozen_string_literal: true

module EmailCampaigns
  module Extensions
    module Project
      def self.included(base)
        base.has_many :email_campaigns,
          foreign_key: :context_id,
          class_name: 'EmailCampaigns::Campaigns::ManualProjectParticipants',
          dependent: :destroy
      end
    end
  end
end
