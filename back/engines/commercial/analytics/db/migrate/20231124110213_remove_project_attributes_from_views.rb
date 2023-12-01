# frozen_string_literal: true

class RemoveProjectAttributesFromViews < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_participations, version: 5, revert_to_version: 4
    update_view :analytics_fact_posts, version: 6, revert_to_version: 5
  end
end
