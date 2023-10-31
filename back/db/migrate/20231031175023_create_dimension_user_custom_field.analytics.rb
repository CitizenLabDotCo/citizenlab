# frozen_string_literal: true

# This migration comes from analytics (originally 20231031174154)
class CreateDimensionUserCustomField < ActiveRecord::Migration[7.0]
  def change
    create_view :analytics_dimension_user_custom_fields
  end
end
