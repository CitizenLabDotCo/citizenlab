module EmailCampaigns
  module Extensions
    module Phase
      def self.included(base)
        base.has_many :email_campaigns, as: :context, class_name: 'EmailCampaigns::Campaign', dependent: :destroy
      end
    end
  end
end
