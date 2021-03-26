class RefactorDemograpicFields < ActiveRecord::Migration[5.1]

  def stringify_values obj
    obj.map do |k,v|
      [k, v && v.to_s]
    end.to_h
  end

  def change
    User.all.each do |u|
      u.update_columns(custom_field_values: stringify_values(u.demographics))
    end

    remove_column :users, :demographics
  end
end
