# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_participations
#
#  id                        :uuid             primary key
#  dimension_user_id         :uuid
#  participant_id            :text
#  dimension_project_id      :uuid
#  dimension_type_id         :uuid
#  dimension_date_created_id :date
#  reactions_count           :integer
#  likes_count               :integer
#  dislikes_count            :integer
#
module Analytics
  class FactParticipation < Analytics::ApplicationRecordView
    self.primary_key = :id
    belongs_to :dimension_user, class_name: 'Analytics::DimensionUser'
    belongs_to :dimension_type, class_name: 'Analytics::DimensionType'
    belongs_to :dimension_date_created, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_project, class_name: 'Analytics::DimensionProject', optional: true
  end
end
