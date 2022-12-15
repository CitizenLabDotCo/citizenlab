# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_projects_fact_visits
#
#  dimension_project_id :uuid
#  fact_visit_id        :uuid
#
# Indexes
#
#  i_analytics_dim_projects_fact_visits_on_project_and_visit_ids  (dimension_project_id,fact_visit_id) UNIQUE
#  i_p_v_project                                                  (dimension_project_id)
#  i_p_v_visit                                                    (fact_visit_id)
#
# Foreign Keys
#
#  fk_rails_...  (fact_visit_id => analytics_fact_visits.id)
#
module Analytics
  # This dummy class has been added to allow us to perform batch inserts/upserts:
  #   DimensionProjectsFactVisits.insert_all(...)
  #   DimensionProjectsFactVisits.upsert_all(...)
  # Other than that, you should not have to interact directly with it (use the
  # +has_and_belongs_to_many(:dimension_projects)+ association defined in
  # `fact_visit.rb` instead).
  class DimensionProjectsFactVisits < ::ApplicationRecord
  end
end
