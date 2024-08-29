class AddPageLayoutToCustomFields < ActiveRecord::Migration[7.0]
  # rubocop:disable Rails/ApplicationRecord
  class StubCustomField < ActiveRecord::Base
    self.table_name = 'custom_fields'
  end
  # rubocop:enable Rails/ApplicationRecord

  def change
    add_column :custom_fields, :page_layout, :string

    reversible do |dir|
      dir.up do
        page_fields = StubCustomField.where(input_type: 'page')
        page_fields.update_all(page_layout: 'default')
      end

      dir.down do
        StubCustomField.update_all(page_layout: nil)
      end
    end
  end
end
