# frozen_string_literal: true

class AddFormSuccessMultilocToPhases < ActiveRecord::Migration[5.1]
  def change
    add_column :phases, :form_success_multiloc, :jsonb, after: :native_survey_button_multiloc, default: {}, null: false
  end
end