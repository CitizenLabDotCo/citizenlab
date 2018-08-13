module EmailCampaigns
  class ManualCampaignsRecipient < ApplicationRecord

    belongs_to :manual_campaign, class_name: 'EmailCampaigns::ManualCampaign'
    belongs_to :user

    DELIVERY_STATUSES = %w(sent bounced failed accepted delivered opened clicked)
    validates :delivery_status, presence: true, inclusion: {in: DELIVERY_STATUSES}

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

    def self.status_counts manual_campaign_id
      counts = where(manual_campaign_id: manual_campaign_id).group(:delivery_status).count
      total_count = where(manual_campaign_id: manual_campaign_id).count
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
  end
end