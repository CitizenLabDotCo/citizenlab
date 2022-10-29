# frozen_string_literal: true

class RemoveHeaderBgFromTenants < ActiveRecord::Migration[6.1]
  def change
    remove_column :tenants, :header_bg, :string
  end
end
