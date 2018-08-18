module EmailCampaigns
  class Consent < ApplicationRecord

    belongs_to :user

    DELIVERY_STATUSES = %w(sent bounced failed accepted delivered opened clicked)
    validates :consented, inclusion: {in: [true, false]}
    # validates :campaign_type, inclusion: {in: Proc.new{DeliveryService.new.campaign_types}}

    def self.create_for_user! user_id
      defined_types = where(user_id: user_id).pluck(:campaign_type)&.uniq
      available_types = DeliveryService.new.campaign_types
      (available_types - defined_types).each do |campaign_type|
        create!(
          user_id: user_id,
          campaign_type: campaign_type,
          consented: true
        )
      end

    end
  end
end