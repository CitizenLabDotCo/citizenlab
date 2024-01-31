# frozen_string_literal: true

class CreateDimensionDatesView < ActiveRecord::Migration[7.0]
  def change
    # TODO: JS - Foreign key issue
    # DETAIL:  constraint fk_rails_a34b51c948 on table analytics_fact_visits depends on table analytics_dimension_dates
    # constraint fk_rails_a9aa810ecf on table analytics_fact_visits depends on table analytics_dimension_dates
    drop_table :analytics_dimension_dates
    create_view :analytics_dimension_dates
  end
end
