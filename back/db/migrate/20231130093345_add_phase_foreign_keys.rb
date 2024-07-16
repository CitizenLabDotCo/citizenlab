# frozen_string_literal: true

class AddPhaseForeignKeys < ActiveRecord::Migration[6.1]
  def change
    %i[baskets polls_responses polls_questions volunteering_causes surveys_responses].each do |table|
      # Failed on staging release - Needs adding later if possible - 11/12/2023
      # add_foreign_key table, :phases, column: :phase_id, on_delete: :nullify
      add_index table, :phase_id
    end
  end
end
