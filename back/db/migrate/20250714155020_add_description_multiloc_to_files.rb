# frozen_string_literal: true

class AddDescriptionMultilocToFiles < ActiveRecord::Migration[7.1]
  def change
    add_column :files, :description_multiloc, :jsonb, default: {}
  end
end
