# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_visits
#
#  id                             :uuid             not null, primary key
#  visitor_id                     :string           not null
#  dimension_user_id              :uuid
#  dimension_channel_id           :uuid
#  dimension_date_first_action_id :date
#  dimension_date_last_action_id  :date
#  duration                       :integer          not null
#  pages_visited                  :integer          not null
#  returning_visitor              :boolean          default(FALSE), not null
#  matomo_visit_id                :integer          not null
#  matomo_last_action_time        :datetime         not null
#
# Indexes
#
#  i_v_channel       (dimension_channel_id)
#  i_v_first_action  (dimension_date_first_action_id)
#  i_v_last_action   (dimension_date_last_action_id)
#  i_v_matomo_visit  (matomo_visit_id) UNIQUE
#  i_v_timestamp     (matomo_last_action_time)
#  i_v_user          (dimension_user_id)
#
# Foreign Keys
#
#  fk_rails_...  (dimension_channel_id => analytics_dimension_channels.id)
#  fk_rails_...  (dimension_date_first_action_id => analytics_dimension_dates.date)
#  fk_rails_...  (dimension_date_last_action_id => analytics_dimension_dates.date)
#
module Analytics
  class FactVisit < Analytics::ApplicationRecord
    belongs_to :dimension_user, class_name: 'Analytics::DimensionUser', optional: true
    belongs_to :dimension_channel, class_name: 'Analytics::DimensionChannel'
    belongs_to :dimension_date_first_action, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_date_last_action, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    has_and_belongs_to_many :dimension_projects, class_name: 'Analytics::DimensionProject', join_table: 'analytics_join_project_visits'
    has_and_belongs_to_many :dimension_locales, class_name: 'Analytics::DimensionLocale', join_table: 'analytics_join_locale_visits'
  end
end
