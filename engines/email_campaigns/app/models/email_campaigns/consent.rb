module EmailCampaigns
  class Consent < ApplicationRecord

    belongs_to :user

    DELIVERY_STATUSES = %w(sent bounced failed accepted delivered opened clicked)
    validates :consented, inclusion: {in: [true, false]}
    # validates :campaign_type, inclusion: {in: Proc.new{DeliveryService.new.campaign_types}}

  end
end