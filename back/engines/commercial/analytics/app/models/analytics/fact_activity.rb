# == Schema Information
#
# Table name: analytics_fact_activities
#
#  id                   :uuid
#  user_id              :uuid
#  project_id           :uuid
#  created_date_id      :uuid
#  activity_type        :text
#  feedback_recieved_at :text
#  time_to_feedback     :integer
#  votes_count          :integer
#  upvotes_count        :integer
#  downvotes_count      :integer
#
# Indexes
#
#  index_analytics_fact_activities_on_created_date_id  (created_date_id)
#  index_analytics_fact_activities_on_id               (id)
#  index_analytics_fact_activities_on_project_id       (project_id)
#
module Analytics
  class FactActivity < Analytics::ApplicationRecord
    def readonly?
      true
    end
  end
end
