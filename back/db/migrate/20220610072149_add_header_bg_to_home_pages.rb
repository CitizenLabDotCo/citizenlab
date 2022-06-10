# frozen_string_literal: true

class AddHeaderBgToHomePages < ActiveRecord::Migration[6.1]
  def change
    add_column :home_pages, :header_bg, :string
  end
end
