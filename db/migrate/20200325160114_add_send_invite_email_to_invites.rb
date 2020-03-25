class AddSendInviteEmailToInvites < ActiveRecord::Migration[6.0]
  def change
    add_column :invites, :send_invite_email, :boolean, null: false, default: true
  end
end
