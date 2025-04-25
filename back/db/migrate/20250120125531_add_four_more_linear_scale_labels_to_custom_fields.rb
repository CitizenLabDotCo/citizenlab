class AddFourMoreLinearScaleLabelsToCustomFields < ActiveRecord::Migration[7.0]
  class StubCustomField < ApplicationRecord
    self.table_name = 'custom_fields'
  end

  def change
    add_column :custom_fields, :linear_scale_label_8_multiloc, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_9_multiloc, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_10_multiloc, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_11_multiloc, :jsonb, default: {}, null: false
  end
end
