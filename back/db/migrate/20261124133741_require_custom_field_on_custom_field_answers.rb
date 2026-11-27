# frozen_string_literal: true

class RequireCustomFieldOnCustomFieldAnswers < ActiveRecord::Migration[7.2]
  def change
    safety_assured do
      up_only { execute 'DELETE FROM custom_field_answers WHERE custom_field_id IS NULL' }
      change_column_null :custom_field_answers, :custom_field_id, false
    end
  end
end
