module EmailCampaigns
  class ManualCampaignsGroup < ApplicationRecord

    belongs_to :manual_campaign, class_name: 'EmailCampaigns::ManualCampaign'
    belongs_to :group

  end
end