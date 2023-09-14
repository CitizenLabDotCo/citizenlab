# frozen_string_literal: true

class AddBasketCountToContext < ActiveRecord::Migration[6.1]
  def change
    %i[projects phases ideas_phases].each do |tablename|
      add_column tablename, :baskets_count, :integer, null: false, default: 0
    end
    add_index :baskets, :submitted_at
  end
end
