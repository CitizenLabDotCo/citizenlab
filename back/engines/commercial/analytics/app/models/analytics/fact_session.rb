# == Schema Information
#
# Table name: analytics_fact_sessions
#
#  id                        :uuid
#  monthly_user_hash         :string
#  dimension_date_created_id :date
#  dimension_date_updated_id :date
#  dimension_user_id         :uuid
#
module Analytics
  class FactSession < Analytics::ApplicationRecord
    belongs_to :dimension_user, class_name: 'Analytics::DimensionUser', optional: true
    belongs_to :dimension_date_created, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_date_updated, class_name: 'Analytics::DimensionDate', primary_key: 'date'

    validates :monthly_user_hash, presence: true
  end
end
