# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_sms_consents
#
#  id            :uuid             not null, primary key
#  campaign_type :string           not null
#  user_id       :uuid             not null
#  consented     :boolean          default(FALSE), not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  idx_on_campaign_type_user_id_7f50a68bd0        (campaign_type,user_id) UNIQUE
#  index_email_campaigns_sms_consents_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
module EmailCampaigns
  class SmsConsent < ApplicationRecord
    belongs_to :user

    validates :consented, inclusion: { in: [true, false] }

    # Unlike email consent (opt-out), SMS rows are created defaulting to NOT
    # consented — the user must explicitly opt in. We still create the rows so
    # the available SMS campaign types are discoverable in the settings UI.
    def self.create_all_for_user!(user)
      defined_types = where(user_id: user.id).pluck(:campaign_type).uniq
      available_types = DeliveryService.new.sms_consentable_campaign_types_for(user)
      (available_types - defined_types).each do |campaign_type|
        create!(
          user_id: user.id,
          campaign_type: campaign_type,
          consented: false
        )
      end
    end
  end
end
