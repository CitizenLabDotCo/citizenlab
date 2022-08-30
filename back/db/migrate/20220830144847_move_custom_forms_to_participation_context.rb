# frozen_string_literal: true

class MoveCustomFormsToParticipationContext < ActiveRecord::Migration[6.1]
  def up
    add_column :custom_forms, :participation_context_id, :uuid
    ActiveRecord::Base.connection.execute <<~SQL.squish
      UPDATE custom_forms t 
      SET participation_context_id = (
        SELECT id
        FROM projects
        WHERE projects.custom_form_id = t.id
      )
    SQL
    delete_custom_form_results = ActiveRecord::Base.connection.execute <<~SQL.squish
      SELECT id
      FROM custom_forms
      WHERE participation_context_id IS NULL
    SQL
    delete_custom_form_ids = delete_custom_form_results.pluck 'id'
    if delete_custom_form_ids.present?
      sql_form_ids = delete_custom_form_ids.map { |id| "'#{id}'" }.join(', ')
      ActiveRecord::Base.connection.execute <<~SQL.squish
        DELETE FROM custom_forms
        WHERE id IN (#{sql_form_ids})
      SQL

      delete_custom_field_results = ActiveRecord::Base.connection.execute <<~SQL.squish
        SELECT id
        FROM custom_fields
        WHERE resource_id IN (#{sql_form_ids})
      SQL
      delete_custom_field_ids = delete_custom_field_results.pluck 'id'
      if delete_custom_field_ids.present?
        sql_field_ids = delete_custom_field_ids.map { |id| "'#{id}'" }.join(', ')
        ActiveRecord::Base.connection.execute <<~SQL.squish
          DELETE FROM custom_field_options
          WHERE custom_field_id IN (#{sql_field_ids})
        SQL
        ActiveRecord::Base.connection.execute <<~SQL.squish
          DELETE FROM custom_fields
          WHERE id IN (#{sql_field_ids})
        SQL
      end
    end
    change_column_null :custom_forms, :participation_context_id, false

    add_column :custom_forms, :participation_context_type, :string
    ActiveRecord::Base.connection.execute <<~SQL.squish
      UPDATE custom_forms
      SET participation_context_type = 'Project'
    SQL
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
