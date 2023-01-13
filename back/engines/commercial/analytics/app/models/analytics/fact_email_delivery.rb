# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_email_deliveries
#
#  id                     :uuid             primary key
#  dimension_date_sent_id :date
#  campaign_id            :uuid
#  automated              :boolean
#
module Analytics
  class FactEmailDelivery < Analytics::ApplicationRecordView
    self.primary_key = :id
    belongs_to :dimension_date_sent, class_name: 'Analytics::DimensionDate', primary_key: 'date'
  end
end
