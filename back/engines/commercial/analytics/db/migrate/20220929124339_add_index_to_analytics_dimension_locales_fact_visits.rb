# frozen_string_literal: true

class AddIndexToAnalyticsDimensionLocalesFactVisits < ActiveRecord::Migration[6.1]
  def change
    add_index(
      :analytics_dimension_locales_fact_visits,
      %i[dimension_locale_id fact_visit_id],
      unique: true,
      name: 'i_analytics_dim_locales_fact_visits_on_locale_and_visit_ids'
    )
  end
end
