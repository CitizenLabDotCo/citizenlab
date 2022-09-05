# frozen_string_literal: true

class RefactorDemograpicFields < ActiveRecord::Migration[5.1]
  def stringify_values(obj)
    obj.transform_values do |v|
      v&.to_s
    end
  end

  def change
    User.all.each do |u|
      u.update_columns(custom_field_values: stringify_values(u.demographics))
    end

    remove_column :users, :demographics
  end
end
