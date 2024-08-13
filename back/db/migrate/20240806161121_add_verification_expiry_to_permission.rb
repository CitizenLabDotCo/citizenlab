# frozen_string_literal: true

class AddVerificationExpiryToPermission < ActiveRecord::Migration[7.0]
  def change
    add_column :permissions, :verification_expiry, :integer, default: nil
  end
end
