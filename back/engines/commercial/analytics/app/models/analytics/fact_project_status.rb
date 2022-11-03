# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_project_statuses
#
#  project_id :uuid
#  status     :string
#  timestamp  :datetime
#  date       :date
#
module Analytics
  class FactProjectStatus < Analytics::ApplicationRecordView
    belongs_to :dimension_date, foreign_key: :date
    belongs_to :project
  end
end
