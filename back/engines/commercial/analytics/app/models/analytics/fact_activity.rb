# == Schema Information
#
# Table name: analytics_fact_activities
#
#  id                        :uuid
#  user_id                   :uuid
#  project_id                :uuid
#  type_id                   :uuid
#  created_date_id           :uuid
#  feedback_recieved_date_id :uuid
#  time_to_feedback          :interval
#  votes_count               :integer
#  upvotes_count             :integer
#  downvotes_count           :integer
#  participants              :integer
#
# Indexes
#
#  index_analytics_fact_activities_on_created_date_id  (created_date_id)
#  index_analytics_fact_activities_on_id               (id)
#  index_analytics_fact_activities_on_project_id       (project_id)
#
module Analytics
  class FactActivity < Analytics::ApplicationRecord
    self.primary_key = :id
    belongs_to :type, class_name: "DimensionType"
    belongs_to :created_date, class_name: "DimensionDate"
    belongs_to :project, class_name: "DimensionProject"

    def readonly?
      true
    end

    def self.refresh
      Scenic.database.refresh_materialized_view(table_name, concurrently: true, cascade: true)
    end

  end
end
