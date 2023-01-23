# frozen_string_literal: true

class AddCreationPhaseForeignKey < ActiveRecord::Migration[6.1]
  def change
    add_foreign_key :ideas, :phases, column: :creation_phase_id
  end
end
