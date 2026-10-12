# frozen_string_literal: true

class AddEmailBounceToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :email_bounced_at, :datetime
    add_column :users, :email_bounce_reason, :string
  end
end
