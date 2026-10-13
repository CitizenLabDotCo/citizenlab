# frozen_string_literal: true

class CreateFeedbackPrompts < ActiveRecord::Migration[7.2]
  def change
    create_table :feedback_prompts, id: :uuid do |t|
      t.references :user, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.string :key, null: false
      t.references :subject, polymorphic: true, type: :uuid, index: false
      t.string :status, null: false, default: 'pending'
      t.datetime :shown_at
      t.datetime :responded_at
      t.integer :score
      t.text :comment

      # Snapshot of the circumstances, frozen at the time the prompt is shown, so
      # reporting doesn't depend on flags or roles that change or disappear later.
      t.string :trigger
      t.string :admin_area
      t.string :ui_version
      t.boolean :staff, null: false, default: false
      t.string :role
      t.string :locale
      t.integer :days_since_last_active
      t.string :project_origin
      t.integer :previously_shown_count

      t.timestamps
    end

    # Enforces at most one prompt per subject (e.g. one setup prompt per project).
    add_index :feedback_prompts, %i[key subject_type subject_id],
      unique: true,
      where: 'subject_id IS NOT NULL',
      name: 'index_feedback_prompts_on_key_and_subject'
  end
end
