# frozen_string_literal: true

class CreateProcessedFlags < ActiveRecord::Migration[6.0]
  def change
    create_table :insights_processed_flags, id: :uuid do |t|
      t.references(:input, type: :uuid, null: false, polymorphic: true,
        index: { name: :index_processed_flags_on_input }
      )
      t.references(:view, type: :uuid, null: false)

      t.index %i[input_id input_type view_id], unique: true, name: 'index_single_processed_flags'
      t.timestamps
    end
  end
end
