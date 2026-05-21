class AddPhaseMethodIdToIdeas < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    safety_assured { add_column :ideas, :phase_method_id, :uuid, null: true } unless column_exists?(:ideas, :phase_method_id)
    add_index :ideas, :phase_method_id, algorithm: :concurrently unless index_exists?(:ideas, :phase_method_id)
    safety_assured { add_foreign_key :ideas, :phase_methods } unless foreign_key_exists?(:ideas, :phase_methods)

    # Backfill: for each idea, pick the PhaseMethod tied to its creation_phase_id.
    # NOTE: When a phase has >1 method this picks an arbitrary one. Once full
    # design lands, write paths should set this explicitly.
    reversible do |dir|
      dir.up do
        safety_assured do
          execute <<-SQL
            UPDATE ideas
            SET phase_method_id = pm.id
            FROM phase_methods pm
            WHERE ideas.creation_phase_id = pm.phase_id
              AND ideas.phase_method_id IS NULL
          SQL
        end
      end
    end
  end
end
