class AddTextSearchColumnToReports < ActiveRecord::Migration[7.0]
  def change
    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          ALTER TABLE report_builder_reports
          ADD COLUMN name_tsvector tsvector GENERATED ALWAYS AS  (
              to_tsvector('simple', name)
          ) STORED;
        SQL
      end

      dir.down do
        remove_column :report_builder_reports, :name_tsvector
      end
    end

    add_index :report_builder_reports, :name_tsvector, using: :gin
  end
end
