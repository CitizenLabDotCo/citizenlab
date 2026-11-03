# frozen_string_literal: true

class AddEmailBouncedAtIndexToUsers < ActiveRecord::Migration[7.2]
  disable_ddl_transaction!

  # The admin users sidebar counts bounced users on every page load. Only a
  # handful of users ever bounce, so a partial index stays tiny while sparing
  # a sequential scan of the users table.
  def change
    add_index :users, :email_bounced_at, where: 'email_bounced_at IS NOT NULL', algorithm: :concurrently
  end
end
