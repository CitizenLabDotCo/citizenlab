# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_posts
#
#  id                     :uuid             primary key
#  user_id                :uuid
#  project_id             :uuid
#  type_id                :uuid
#  created_date           :date
#  feedback_first_date    :date
#  feedback_time_taken    :interval
#  feedback_official      :integer
#  feedback_status_change :integer
#  feedback_none          :integer
#  votes_count            :integer
#  upvotes_count          :integer
#  downvotes_count        :integer
#
# Indexes
#
#  index_analytics_fact_posts_on_created_date  (created_date)
#  index_analytics_fact_posts_on_id            (id)
#  index_analytics_fact_posts_on_project_id    (project_id)
#
module Analytics
  class FactPost < Analytics::ApplicationRecord
    attribute :feedback_time_taken, :string
    self.primary_key = :id
    belongs_to :type, class_name: 'DimensionType'
    belongs_to :created_date, class_name: 'DimensionDate', foreign_key: 'created_date'
    belongs_to :project, class_name: 'DimensionProject'

    def self.refresh
      Scenic.database.refresh_materialized_view(table_name, concurrently: false, cascade: true)
    end
  end
end
