# frozen_string_literal: true

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

    DELIVERY_STATUSES = %w[sent bounced failed accepted delivered opened clicked]
    validates :delivery_status, presence: true, inclusion: { in: DELIVERY_STATUSES }
    validates :sent_at, presence: true

    before_validation :set_sent_at

    counter_culture :campaign, column_name: 'deliveries_count'

    STATUS_SUMMATION = {
      sent: %i[sent bounced failed accepted delivered opened clicked],
      bounced: [:bounced],
      failed: [:failed],
      accepted: %i[accepted delivered opened clicked],
      delivered: %i[delivered opened clicked],
      opened: %i[opened clicked],
      clicked: [:clicked]
    }

    def set_delivery_status(s)
      self.delivery_status =
        if %w[bounced failed].include?(s)
          s
        else
          current_status_index = DELIVERY_STATUSES.find_index(delivery_status)
          new_status_index = DELIVERY_STATUSES.find_index(s)
          DELIVERY_STATUSES[[current_status_index, new_status_index].max]
        end
    end

    def self.status_counts(campaign_id)
      counts = where(campaign_id: campaign_id).group(:delivery_status).count
      total_count = where(campaign_id: campaign_id).count
      {
        sent: STATUS_SUMMATION[:sent].sum { |s| counts[s.to_s] || 0 },
        bounced: STATUS_SUMMATION[:bounced].sum { |s| counts[s.to_s] || 0 },
        failed: STATUS_SUMMATION[:failed].sum { |s| counts[s.to_s] || 0 },
        accepted: STATUS_SUMMATION[:accepted].sum { |s| counts[s.to_s] || 0 },
        delivered: STATUS_SUMMATION[:delivered].sum { |s| counts[s.to_s] || 0 },
        opened: STATUS_SUMMATION[:opened].sum { |s| counts[s.to_s] || 0 },
        clicked: STATUS_SUMMATION[:clicked].sum { |s| counts[s.to_s] || 0 },
        total: total_count
      }
    end

    def set_sent_at
      self.sent_at ||= Time.now
    end
  end
end
