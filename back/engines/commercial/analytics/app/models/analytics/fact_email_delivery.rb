# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_email_deliveries
#
#  id                     :uuid             primary key
#  dimension_date_sent_id :date
#  campaign_id            :uuid
#  dimension_project_id   :uuid
#  automated              :boolean
#  dimension_user_id      :uuid
#
module Analytics
  class FactEmailDelivery < Analytics::ApplicationRecordView
    self.primary_key = :id
    belongs_to :dimension_date_sent, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_project, class_name: 'Analytics::DimensionProject', optional: true
    belongs_to :dimension_user, class_name: 'Analytics::DimensionUser', optional: true
  end
end
