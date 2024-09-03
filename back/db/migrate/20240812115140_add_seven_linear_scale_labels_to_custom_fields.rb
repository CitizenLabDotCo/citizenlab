class AddSevenLinearScaleLabelsToCustomFields < ActiveRecord::Migration[7.0]
  class StubCustomField < ApplicationRecord
    self.table_name = 'custom_fields'
  end

  def change
    add_column :custom_fields, :linear_scale_label_1_multiloc, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_2_multiloc, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_3_multiloc, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_4_multiloc, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_5_multiloc, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_6_multiloc, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_7_multiloc, :jsonb, default: {}, null: false

    linear_scale_fields = StubCustomField.where(input_type: 'linear_scale')
    linear_scale_fields.each do |field|
      min_label = field.minimum_label_multiloc
      max_label = field.maximum_label_multiloc

      field.linear_scale_label_1_multiloc = min_label if min_label.present?
      field.send(:"linear_scale_label_#{field.maximum}_multiloc=", max_label) if max_label.present?
      field.save!
    end
  end
end
