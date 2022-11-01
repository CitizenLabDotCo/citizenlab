# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_posts
#
#  id                               :uuid             primary key
#  user_id                          :uuid
#  dimension_project_id             :uuid
#  dimension_type_id                :uuid
#  dimension_date_created_id        :date
#  dimension_date_first_feedback_id :date
#  dimension_status_id              :uuid
#  feedback_time_taken              :interval
#  feedback_official                :integer
#  feedback_status_change           :integer
#  feedback_none                    :integer
#  votes_count                      :integer
#  upvotes_count                    :integer
#  downvotes_count                  :integer
#
module Analytics
  class FactPost < Analytics::ApplicationRecordView
    self.primary_key = :id
    attribute :feedback_time_taken, :string
    belongs_to :type, class_name: 'Analytics::DimensionType'
    belongs_to :created_date, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :project, class_name: 'Analytics::DimensionProject'
    belongs_to :status, class_name: 'Analytics::DimensionStatus'
  end
end
