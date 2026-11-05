# frozen_string_literal: true

class AddMergeTargetEmailToUsers < ActiveRecord::Migration[7.1]
  def change
    # The address of the account this user wants to be merged into. Pending state
    # like new_email, but never promoted to email: another account already owns it.
    add_column :users, :merge_target_email, :string
  end
end
