# frozen_string_literal: true

class AddNativeSurveyTitleToPhase < ActiveRecord::Migration[5.1]
  def change
    add_column :phases, :native_survey_title_multiloc, :jsonb, default: {}
    add_column :phases, :native_survey_button_multiloc, :jsonb, default: {}
  end
end
