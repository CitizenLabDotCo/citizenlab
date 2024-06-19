# frozen_string_literal: true

class RemoveDimensionUserCustomFieldValues < ActiveRecord::Migration[7.0]
  def change
    drop_view :analytics_dimension_user_custom_field_values
  end
end
