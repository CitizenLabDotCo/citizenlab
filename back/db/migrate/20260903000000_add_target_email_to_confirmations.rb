# frozen_string_literal: true

class AddTargetEmailToConfirmations < ActiveRecord::Migration[7.1]
  def change
    # Only MergeAccountConfirmation uses this: the address whose ownership the
    # code proves, belonging to the account the caller is asking to be merged
    # into. Deliberately an email rather than a user reference - what the code
    # proves is control of an inbox, so the owning account is resolved at
    # confirm time.
    add_column :confirmations, :target_email, :string
  end
end
