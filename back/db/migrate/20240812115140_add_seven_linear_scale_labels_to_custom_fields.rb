class AddSevenLinearScaleLabelsToCustomFields < ActiveRecord::Migration[7.0]
  class StubCustomField < ApplicationRecord
    self.table_name = 'custom_fields'
  end

  def change
    add_column :custom_fields, :linear_scale_label_multiloc_n1, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_multiloc_n2, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_multiloc_n3, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_multiloc_n4, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_multiloc_n5, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_multiloc_n6, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_multiloc_n7, :jsonb, default: {}, null: false

    linear_scale_fields = StubCustomField.where(input_type: 'linear_scale')
    linear_scale_fields.each do |field|
      min_label = field.minimum_label_multiloc
      max_label = field.maximum_label_multiloc

      field.linear_scale_label_multiloc_n1 = min_label if min_label.present?
      field.send(:"linear_scale_label_multiloc_n#{field.maximum}=", max_label) if max_label.present?
      field.save!
    end
  end
end
