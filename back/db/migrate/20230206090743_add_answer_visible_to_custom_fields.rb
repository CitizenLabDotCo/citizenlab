# frozen_string_literal: true

class AddAnswerVisibleToCustomFields < ActiveRecord::Migration[6.1]
  def change
    add_column :custom_fields, :answer_visible_to, :string, default: CustomField::VISIBLE_TO_ADMINS, null: false
    CustomField.where.not(code: nil).update_all(answer_visible_to: CustomField::VISIBLE_TO_PUBLIC)
    CustomField.where(input_type: %w[page section]).update_all(answer_visible_to: CustomField::VISIBLE_TO_PUBLIC)
  end
end
