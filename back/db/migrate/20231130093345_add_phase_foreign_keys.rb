# frozen_string_literal: true

class AddPhaseForeignKeys < ActiveRecord::Migration[6.1]
  def change
    %i[baskets polls_responses polls_questions volunteering_causes surveys_responses].each do |table|
      add_foreign_key table, :phases, column: :phase_id, on_delete: :nullify
      add_index table, :phase_id
    end
  end
end
