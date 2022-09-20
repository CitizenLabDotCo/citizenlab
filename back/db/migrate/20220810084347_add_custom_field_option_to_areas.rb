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
        ::UserCustomFields::DataMigrations::CreateDomicileOptionsJob.perform_later if domicile_custom_field_id
      end
    end
  end

  private

  def domicile_custom_field_id
    @domicile_custom_field_id ||= execute(<<-SQL.squish).first&.[]('id')
      SELECT id FROM custom_fields WHERE key = 'domicile'
    SQL
  end

  def delete_domicile_options
    execute <<~SQL.squish
      DELETE FROM custom_field_options
      WHERE custom_field_id = '#{domicile_custom_field_id}'
    SQL
  end
end
