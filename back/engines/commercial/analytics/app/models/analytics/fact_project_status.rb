# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_project_statuses
#
#  dimension_project_id :uuid
#  status               :string
#  timestamp            :datetime
#  dimension_date_id    :date
#
module Analytics
  class FactProjectStatus < Analytics::ApplicationRecordView
    belongs_to :dimension_date
    belongs_to :dimension_project
  end
end
