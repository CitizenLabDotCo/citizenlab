# frozen_string_literal: true

class AddCategoryToCustomFields < ActiveRecord::Migration[7.1]
  def change
    add_column :custom_fields, :question_category, :string
  end
end
