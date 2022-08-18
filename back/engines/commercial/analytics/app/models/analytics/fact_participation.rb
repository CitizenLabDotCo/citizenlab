# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_participations
#
#  id              :uuid             primary key
#  user_id         :uuid
#  project_id      :uuid
#  type_id         :uuid
#  created_date    :date
#  votes_count     :integer
#  upvotes_count   :integer
#  downvotes_count :integer
#
module Analytics
  class FactParticipation < Analytics::ApplicationView
    self.primary_key = :id
    belongs_to :type, class_name: 'DimensionType'
    belongs_to :created_date, class_name: 'DimensionDate', foreign_key: 'created_date'
    belongs_to :project, class_name: 'DimensionProject'

    def self.refresh
      Scenic.database.refresh_materialized_view(table_name, concurrently: true, cascade: true)
    end
  end
end
