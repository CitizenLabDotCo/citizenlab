# frozen_string_literal: true

class AddStartLabelAndEndLabelToCustomFields < ActiveRecord::Migration[6.1]
  def change
    add_column :custom_fields, :maximum, :integer
    add_column :custom_fields, :minimum_label_multiloc, :jsonb, null: false, default: {}
    add_column :custom_fields, :maximum_label_multiloc, :jsonb, null: false, default: {}
  end
end
