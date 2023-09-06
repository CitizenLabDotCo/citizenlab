# frozen_string_literal: true

class AddIncludeInOnboardingToTopicsAndAreas < ActiveRecord::Migration[7.0]
  def change
    %i[areas topics].each do |table|
      add_column table, :include_in_onboarding, :boolean, default: false, null: false
      add_index table, :include_in_onboarding
    end
  end
end
