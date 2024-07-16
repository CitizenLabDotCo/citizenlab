# frozen_string_literal: true

class CreateDimensionUserCustomFieldValues < ActiveRecord::Migration[7.0]
  def change
    create_view :analytics_dimension_user_custom_field_values
  end
end
