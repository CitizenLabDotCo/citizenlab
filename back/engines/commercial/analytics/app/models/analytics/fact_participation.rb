# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_participations
#
#  id                        :uuid             primary key
#  dimension_user_id         :uuid
#  participant_id            :uuid
#  dimension_project_id      :uuid
#  dimension_date_created_id :date
#  item_type                 :string
#  action_type               :string
#  reactable_type            :text
#  reaction_id               :text
#
module Analytics
  class FactParticipation < Analytics::ApplicationRecordView
    self.primary_key = :id
    belongs_to :dimension_user, class_name: 'Analytics::DimensionUser'
    has_many :dimension_user_custom_field_values, class_name: 'Analytics::DimensionUserCustomFieldValue', foreign_key: :dimension_user_id, primary_key: :dimension_user_id
    belongs_to :dimension_date_created, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_project, class_name: 'Analytics::DimensionProject', optional: true
  end
end
