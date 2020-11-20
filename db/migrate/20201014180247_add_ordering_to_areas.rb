class AddOrderingToAreas < ActiveRecord::Migration[6.0]
  def change
    add_column :areas, :ordering, :integer
    set_default_order
  end

  def set_default_order
    Area.order(:created_at).each_with_index do |area, index|
      area.update_column :ordering, index
    end
  end
end
