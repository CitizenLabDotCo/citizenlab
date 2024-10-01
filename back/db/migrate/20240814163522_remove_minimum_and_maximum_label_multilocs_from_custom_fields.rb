class RemoveMinimumAndMaximumLabelMultilocsFromCustomFields < ActiveRecord::Migration[7.0]
  class StubCustomField < ApplicationRecord
    self.table_name = 'custom_fields'
  end

  def change
    reversible do |dir|
      dir.up do
        remove_column :custom_fields, :minimum_label_multiloc
        remove_column :custom_fields, :maximum_label_multiloc
      end

      dir.down do
        add_column :custom_fields, :minimum_label_multiloc, :jsonb, default: {}
        add_column :custom_fields, :maximum_label_multiloc, :jsonb, default: {}

        linear_scale_fields = StubCustomField.where(input_type: 'linear_scale')
        linear_scale_fields.each do |field|
          min_label = field.linear_scale_label_1_multiloc
          max_label = field.send(:"linear_scale_label_#{field.maximum}_multiloc") if field&.maximum.present?

          field.minimum_label_multiloc = min_label if min_label.present?
          field.maximum_label_multiloc = max_label if max_label.present?
          field.save!
        end
      end
    end
  end
end
