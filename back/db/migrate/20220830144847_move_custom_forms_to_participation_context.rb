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
    # We identified that some tenants in production have forms that are not
    # associated with a project. That is problematic, because `participation_context_id`
    # cannot be nil in a polymorphic association.
    # Forms without projects are inconsistent data and they are useless,
    # so we delete them, together with their fields and field options.
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
      # If there are custom fields associated with a custom form that has to be deleted,
      # we have to delete them as well.
      delete_custom_field_results = ActiveRecord::Base.connection.execute <<~SQL.squish
        SELECT id
        FROM custom_fields
        WHERE resource_id IN (#{sql_form_ids})
      SQL
      delete_custom_field_ids = delete_custom_field_results.pluck 'id'
      if delete_custom_field_ids.present?
        sql_field_ids = delete_custom_field_ids.map { |id| "'#{id}'" }.join(', ')
        # If there are custom field options associated with a custom field that has
        # to be deleted, we have to delete them as well.
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
