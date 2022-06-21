# == Schema Information
#
# Table name: analytics_fact_activities
#
#  id                   :uuid
#  author_id            :uuid
#  project_id           :uuid
#  created_date_id      :uuid
#  activity_type        :text
#  feedback_recieved_at :text
#  time_to_feedback     :integer
#  votes_count          :integer
#  upvotes_count        :integer
#  downvotes_count      :integer
#
module Analytics
  class FactActivity < Analytics::ApplicationRecord
    def readonly?
      true
    end
  end
end
