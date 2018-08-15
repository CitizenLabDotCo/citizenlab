module EmailCampaigns
  class Consent < ApplicationRecord

    # belongs_to :campaign_type, inclusion: {in: -> {Campaign.distinct(:type).pluck(&:type)}}
    belongs_to :user

    DELIVERY_STATUSES = %w(sent bounced failed accepted delivered opened clicked)
    validates :consented, presence: true, inclusion: {in: [true, false]}

  end
end