module EmailCampaigns
  class CampaignsRecipient < ApplicationRecord

    belongs_to :campaign, class_name: 'EmailCampaigns::Campaign'
    belongs_to :user

    DELIVERY_STATUSES = %w(sent bounced failed accepted delivered opened clicked)
    validates :delivery_status, presence: true, inclusion: {in: DELIVERY_STATUSES}

    def set_delivery_status s
      self.delivery_status = 
        if s == 'bounced' || s == 'failed'
          s
        else
          current_status_index = DELIVERY_STATUSES.find_index(delivery_status)
          new_status_index = DELIVERY_STATUSES.find_index(s)
          DELIVERY_STATUSES[[current_status_index, new_status_index].max]
        end
    end
  end
end