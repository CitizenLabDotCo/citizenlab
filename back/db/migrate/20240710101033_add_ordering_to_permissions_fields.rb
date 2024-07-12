# frozen_string_literal: true

class AddOrderingToPermissionsFields < ActiveRecord::Migration[7.0]
  def change
    add_column :permissions_fields, :ordering, :integer, default: 0

    # Now set the order on the fields
    Permission.all.each do |permission|
      order = 0
      permission.permissions_fields.order(created_at: :asc).each do |field|
        field.ordering = order
        field.save!
        order += 1
      end
    end
  end
end
