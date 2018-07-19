module EmailCampaigns
  class CampaignsRecipient < ApplicationRecord

    belongs_to :campaign, class_name: 'EmailCampaigns::Campaign'
    belongs_to :user

    DELIVERY_STATUSES = %w(sent accepted delivered opened clicked bounced)
    validates :delivery_status, presence: true, inclusion: {in: DELIVERY_STATUSES}

  end
end