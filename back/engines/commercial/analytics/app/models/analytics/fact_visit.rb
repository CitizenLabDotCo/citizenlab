# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_visits
#
#  id                             :uuid             not null, primary key
#  visitor_id                     :string           not null
#  dimension_user_id              :uuid
#  dimension_referrer_type_id     :uuid             not null
#  dimension_date_first_action_id :date             not null
#  dimension_date_last_action_id  :date             not null
#  duration                       :integer          not null
#  pages_visited                  :integer          not null
#  returning_visitor              :boolean          default(FALSE), not null
#  referrer_name                  :string
#  referrer_url                   :string
#  matomo_visit_id                :integer          not null
#  matomo_last_action_time        :datetime         not null
#
# Indexes
#
#  i_v_first_action   (dimension_date_first_action_id)
#  i_v_last_action    (dimension_date_last_action_id)
#  i_v_matomo_visit   (matomo_visit_id) UNIQUE
#  i_v_referrer_type  (dimension_referrer_type_id)
#  i_v_timestamp      (matomo_last_action_time)
#  i_v_user           (dimension_user_id)
#
# Foreign Keys
#
#  fk_rails_...  (dimension_date_first_action_id => analytics_dimension_dates.date)
#  fk_rails_...  (dimension_date_last_action_id => analytics_dimension_dates.date)
#  fk_rails_...  (dimension_referrer_type_id => analytics_dimension_referrer_types.id)
#
module Analytics
  class FactVisit < Analytics::ApplicationRecord
    belongs_to :dimension_user, class_name: 'Analytics::DimensionUser', optional: true
    belongs_to :dimension_referrer_type, class_name: 'Analytics::DimensionReferrerType'
    belongs_to :dimension_date_first_action, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_date_last_action, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    has_and_belongs_to_many :dimension_projects, class_name: 'Analytics::DimensionProject', join_table: 'analytics_dimension_projects_fact_visits'
    has_and_belongs_to_many :dimension_locales, class_name: 'Analytics::DimensionLocale', join_table: 'analytics_dimension_locales_fact_visits'

    validates :visitor_id, presence: true
    validates :duration, presence: true
    validates :pages_visited, presence: true
    validates :matomo_visit_id, presence: true, uniqueness: true
    validates :matomo_last_action_time, presence: true
  end
end
