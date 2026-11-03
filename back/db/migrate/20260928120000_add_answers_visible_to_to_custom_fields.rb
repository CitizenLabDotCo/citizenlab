# frozen_string_literal: true

class AddAnswersVisibleToToCustomFields < ActiveRecord::Migration[7.1]
  def up
    add_column :custom_fields, :answers_visible_to, :string, default: 'moderators', null: false

    # Built-in input fields are shown on the idea page.
    safety_assured do
      execute <<~SQL.squish
        UPDATE custom_fields
        SET answers_visible_to = 'public'
        WHERE resource_type = 'CustomForm' AND code IS NOT NULL AND input_type <> 'page'
      SQL
    end
  end

  def down
    remove_column :custom_fields, :answers_visible_to
  end
end
