# frozen_string_literal: true

class AddAllowMultipleResponsesToPhases < ActiveRecord::Migration[7.2]
  def change
    add_column :phases, :allow_multiple_responses, :boolean, default: false, null: false
  end
end
