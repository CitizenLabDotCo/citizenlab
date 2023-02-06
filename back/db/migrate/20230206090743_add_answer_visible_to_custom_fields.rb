# frozen_string_literal: true

class AddAnswerVisibleToCustomFields < ActiveRecord::Migration[6.1]
  def change
    add_column :custom_fields, :answer_visible_to, :string, default: 'admins', null: false
  end
end
