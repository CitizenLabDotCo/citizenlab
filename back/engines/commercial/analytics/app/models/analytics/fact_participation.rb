# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_participations
#
#  id                     :uuid             primary key
#  dimension_user_id      :uuid
#  dimension_project_id   :uuid
#  dimension_type_id      :uuid
#  dimension_date_created :date
#  votes_count            :integer
#  upvotes_count          :integer
#  downvotes_count        :integer
#
module Analytics
  class FactParticipation < Analytics::ApplicationRecordView
    self.primary_key = :id
    belongs_to :dimension_type, class_name: 'DimensionType'
    belongs_to :dimension_date_created, class_name: 'DimensionDate', primary_key: 'date'
    belongs_to :dimension_project, class_name: 'DimensionProject'
  end
end
