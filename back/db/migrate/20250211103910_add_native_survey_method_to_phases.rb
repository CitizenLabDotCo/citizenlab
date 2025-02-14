# frozen_string_literal: true

class AddNativeSurveyMethodToPhases < ActiveRecord::Migration[7.1]
  def change
    add_column :phases, :native_survey_method, :string, null: true, default: nil
    Phase.where(participation_method: 'native_survey').update_all(native_survey_method: 'standard')
  end
end
