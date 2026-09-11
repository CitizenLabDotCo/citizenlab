# frozen_string_literal: true

class AddTargetEmailToConfirmations < ActiveRecord::Migration[7.1]
  def change
    # MergeAccountConfirmation only: the address whose ownership the code proves.
    # An email rather than a user reference, because what the code proves is control
    # of an inbox - the owning account is resolved at confirm time.
    add_column :confirmations, :target_email, :string
  end
end
