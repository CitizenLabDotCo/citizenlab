# frozen_string_literal: true

class MoveCustomFormsToParticipationContext < ActiveRecord::Migration[6.1]
  def up
    add_column :custom_forms, :participation_context_id, :uuid
    add_column :custom_forms, :participation_context_type, :string

    ActiveRecord::Base.connection.execute <<~SQL.squish
      UPDATE custom_forms t 
      SET participation_context_id = (
        SELECT id
        FROM projects
        WHERE projects.custom_form_id = t.id
      )
    SQL
    ActiveRecord::Base.connection.execute <<~SQL.squish
      UPDATE custom_forms
      SET participation_context_type = 'Project'
    SQL

    change_column_null :custom_forms, :participation_context_id, false
    change_column_null :custom_forms, :participation_context_type, false
    add_index(
      :custom_forms,
      %i[participation_context_id participation_context_type],
      name: 'index_custom_forms_on_participation_context',
      unique: true
    )

    remove_column :projects, :custom_form_id
  end

  def down
    add_reference :projects, :custom_form, foreign_key: true, type: :uuid
    ActiveRecord::Base.connection.execute <<~SQL.squish
      UPDATE projects t 
      SET custom_form_id = (
        SELECT id
        FROM custom_forms
        WHERE custom_forms.participation_context_id = t.id
      )
    SQL

    remove_column :custom_forms, :participation_context_id
    remove_column :custom_forms, :participation_context_type
  end
end
