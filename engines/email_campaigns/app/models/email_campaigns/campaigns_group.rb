module EmailCampaigns
  class CampaignsGroup < ApplicationRecord

    belongs_to :campaign, class_name: 'EmailCampaigns::Campaign'
    belongs_to :group

  end
end