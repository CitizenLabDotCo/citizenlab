# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_locales_fact_visits
#
#  dimension_locale_id :uuid
#  fact_visit_id       :uuid
#
# Indexes
#
#  i_analytics_dim_locales_fact_visits_on_locale_and_visit_ids  (dimension_locale_id,fact_visit_id) UNIQUE
#  i_l_v_locale                                                 (dimension_locale_id)
#  i_l_v_visit                                                  (fact_visit_id)
#
# Foreign Keys
#
#  fk_rails_...  (dimension_locale_id => analytics_dimension_locales.id)
#  fk_rails_...  (fact_visit_id => analytics_fact_visits.id)
#
module Analytics
  # This dummy class has been added to allow us to perform batch inserts/upserts:
  #   DimensionLocalesFactVisits.insert_all(...)
  #   DimensionLocalesFactVisits.upsert_all(...)
  # Other than that, you should not have to interact directly with it (use the
  # +has_and_belongs_to_many(:dimension_locales)+ association defined in
  # `fact_visit.rb` instead).
  class DimensionLocalesFactVisits < ::ApplicationRecord
  end
end
