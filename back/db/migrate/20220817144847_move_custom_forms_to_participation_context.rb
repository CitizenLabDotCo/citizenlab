# frozen_string_literal: true

class MoveCustomFormsToParticipationContext < ActiveRecord::Migration[6.1]
  def change
    add_column :custom_forms, :participation_context_id, :uuid
    ActiveRecord::Base.connection.execute <<~SQL.squish
      UPDATE custom_forms t 
      SET participation_context_id = (
        SELECT id
        FROM projects
        WHERE projects.custom_form_id = t.id
      )
    SQL

    add_column :custom_forms, :participation_context_type, :string
    ActiveRecord::Base.connection.execute <<~SQL.squish
      UPDATE custom_forms
      SET participation_context_type = 'Project'
      WHERE participation_context_id IS NOT NULL
    SQL

    add_index(
      :custom_forms,
      %i[participation_context_id participation_context_type],
      name: 'index_custom_forms_on_participation_context',
      unique: true
    )

    remove_column :projects, :custom_form_id
  end
end
