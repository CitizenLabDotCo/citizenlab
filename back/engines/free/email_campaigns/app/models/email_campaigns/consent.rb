# == Schema Information
#
# Table name: email_campaigns_consents
#
#  id            :uuid             not null, primary key
#  campaign_type :string           not null
#  user_id       :uuid             not null
#  consented     :boolean          not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_email_campaigns_consents_on_campaign_type_and_user_id  (campaign_type,user_id) UNIQUE
#  index_email_campaigns_consents_on_user_id                    (user_id)
#
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
