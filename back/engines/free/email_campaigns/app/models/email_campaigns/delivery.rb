# == Schema Information
#
# Table name: email_campaigns_deliveries
#
#  id              :uuid             not null, primary key
#  campaign_id     :uuid             not null
#  user_id         :uuid             not null
#  delivery_status :string           not null
#  tracked_content :jsonb
#  sent_at         :datetime
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_email_campaigns_deliveries_on_campaign_id              (campaign_id)
#  index_email_campaigns_deliveries_on_campaign_id_and_user_id  (campaign_id,user_id)
#  index_email_campaigns_deliveries_on_sent_at                  (sent_at)
#  index_email_campaigns_deliveries_on_user_id                  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (campaign_id => email_campaigns_campaigns.id)
#
module EmailCampaigns
  class Delivery < ApplicationRecord

    belongs_to :campaign, class_name: 'EmailCampaigns::Campaign'
    belongs_to :user

    DELIVERY_STATUSES = %w(sent bounced failed accepted delivered opened clicked)
    validates :delivery_status, presence: true, inclusion: {in: DELIVERY_STATUSES}
    validates :sent_at, presence: true

    before_validation :set_sent_at

    counter_culture :campaign, column_name: "deliveries_count"

    STATUS_SUMMATION = {
      sent: [:sent, :bounced, :failed, :accepted, :delivered, :opened, :clicked],
      bounced: [:bounced],
      failed: [:failed],
      accepted: [:accepted, :delivered, :opened, :clicked],
      delivered: [:delivered, :opened, :clicked],
      opened: [:opened, :clicked],
      clicked: [:clicked],
    }

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

    def self.status_counts campaign_id
      counts = where(campaign_id: campaign_id).group(:delivery_status).count
      total_count = where(campaign_id: campaign_id).count
      {
        sent: STATUS_SUMMATION[:sent].map{|s| counts[s.to_s] || 0}.inject(:+),
        bounced: STATUS_SUMMATION[:bounced].map{|s| counts[s.to_s] || 0}.inject(:+),
        failed: STATUS_SUMMATION[:failed].map{|s| counts[s.to_s] || 0}.inject(:+),
        accepted: STATUS_SUMMATION[:accepted].map{|s| counts[s.to_s] || 0}.inject(:+),
        delivered: STATUS_SUMMATION[:delivered].map{|s| counts[s.to_s] || 0}.inject(:+),
        opened: STATUS_SUMMATION[:opened].map{|s| counts[s.to_s] || 0}.inject(:+),
        clicked: STATUS_SUMMATION[:clicked].map{|s| counts[s.to_s] || 0}.inject(:+),
        total: total_count
      }
    end

    def set_sent_at
      self.sent_at ||= Time.now
    end

  end
end
