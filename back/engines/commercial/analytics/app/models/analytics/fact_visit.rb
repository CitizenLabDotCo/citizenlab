# == Schema Information
#
# Table name: analytics_fact_visits
#
#  id                    :uuid             not null, primary key
#  visitor_id            :string           not null
#  user_id               :string
#  channel_id            :string
#  first_action_date_id  :date
#  last_action_date_id   :date
#  duration              :integer
#  pages_visited         :integer
#  returning_visitor     :boolean          default(TRUE), not null
#  matomo_visit_id       :string           not null
#  last_action_timestamp :integer          not null
#
module Analytics
  class FactVisit < Analytics::ApplicationRecord
    self.primary_key = :id
    belongs_to :first_action_date, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :last_action_date, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :channel, class_name: 'Analytics::DimensionChannel'
    has_and_belongs_to_many :project, class_name: 'Analytics::DimensionProject', join_table: 'analytics_join_project_visits'
    has_and_belongs_to_many :locale, class_name: 'Analytics::DimensionLocale', join_table: 'analytics_join_locale_visits'
  end
end
