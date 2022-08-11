# frozen_string_literal: true

class AddCustomFieldOptionToAreas < ActiveRecord::Migration[6.1]
  def change
    reversible do |dir|
      dir.down do
        delete_domicile_options if domicile_custom_field_id
      end
    end

    add_reference :areas, :custom_field_option, foreign_key: true, type: :uuid, index: true

    reversible do |dir|
      dir.up do
        create_custom_field_options if domicile_custom_field_id
      end
    end
  end

  private

  def domicile_custom_field_id
    @domicile_custom_field_id ||= execute(<<-SQL.squish).first&.[]('id')
          SELECT id FROM custom_fields WHERE key = 'domicile'
    SQL
  end

  def generate_key(area_attrs)
    title_multiloc = JSON.parse(area_attrs['title_multiloc'])
    area_name = title_multiloc.values.first.parameterize.snakecase
    "area-#{area_attrs['ordering']}-#{area_name}"
  end

  def create_custom_field_options
    areas = execute('SELECT * FROM areas')

    areas.each do |area|
      option_id = create_domicile_option(generate_key(area), area['title_multiloc'], area['ordering'])
      update_area_foreign_key(area['id'], option_id)
    end

    create_somewhere_else_option(areas.count)
  end

  def create_domicile_option(key, title_multiloc, ordering)
    insert_option_query = <<~SQL.squish
      INSERT INTO custom_field_options (custom_field_id, key, title_multiloc, ordering, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    SQL

    result = exec_insert(
      insert_option_query,
      'SQL',
      [domicile_custom_field_id, key, title_multiloc, ordering]
    )

    result.first&.[]('id')
  end

  def create_somewhere_else_option(ordering)
    title_multiloc = CL2_SUPPORTED_LOCALES.index_with do |locale|
      I18n.t('custom_field_options.domicile.outside', locale: locale)
    end.compact
    key = "area-#{ordering}-somewhere_else"
    create_domicile_option(key, title_multiloc.to_json, ordering)
  end

  def update_area_foreign_key(area_id, option_id)
    exec_update <<~SQL.squish, 'SQL', [option_id, area_id]
      UPDATE areas
      SET custom_field_option_id = $1
      WHERE id = $2
    SQL
  end

  def delete_domicile_options
    execute <<~SQL.squish
      DELETE FROM custom_field_options
      WHERE custom_field_id = '#{domicile_custom_field_id}'
    SQL
  end
end
