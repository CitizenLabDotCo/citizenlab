class AddFourMoreLinearScaleLabelsToCustomFields < ActiveRecord::Migration[7.0]
  class StubCustomField < ApplicationRecord
    self.table_name = 'custom_fields'
  end

  def change
    add_column :custom_fields, :linear_scale_label_8_multiloc, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_9_multiloc, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_10_multiloc, :jsonb, default: {}, null: false
    add_column :custom_fields, :linear_scale_label_11_multiloc, :jsonb, default: {}, null: false

    reversible do |dir|
      dir.up do
        linear_scale_fields = StubCustomField.where(input_type: 'linear_scale')
        linear_scale_fields.each do |field|
          max_label = field.maximum_label_multiloc

          (8..11).each do |index|
            field.send(:"linear_scale_label_#{index}_multiloc=", max_label) if max_label.present?
          end

          field.save!
        end
      end
    end
  end
end
