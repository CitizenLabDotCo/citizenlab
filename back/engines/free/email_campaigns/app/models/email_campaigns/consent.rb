module EmailCampaigns
  class Consent < ApplicationRecord

    belongs_to :user

    validates :consented, inclusion: {in: [true, false]}

    def self.create_all_for_user! user
      defined_types = where(user_id: user.id).pluck(:campaign_type)&.uniq
      available_types = DeliveryService.new.consentable_campaign_types_for(user)
      (available_types - defined_types).each do |campaign_type|
        create!(
          user_id: user.id,
          campaign_type: campaign_type,
          consented: true
        )
      end

    end
  end
end