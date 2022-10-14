# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_posts
#
#  id                     :uuid             primary key
#  user_id                :uuid
#  project_id             :uuid
#  type_id                :uuid
#  created_date_id        :date
#  feedback_first_date    :date
#  feedback_time_taken    :interval
#  feedback_official      :integer
#  feedback_status_change :integer
#  feedback_none          :integer
#  votes_count            :integer
#  upvotes_count          :integer
#  downvotes_count        :integer
#  status_id              :uuid
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
