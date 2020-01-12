class CreateUnsubscriptionTokens < ActiveRecord::Migration[5.2]
  def change
    create_table :email_campaigns_unsubscription_tokens, id: :uuid do |t|
      t.string :token, null: false, index: true
      t.references :user, type: :uuid, index: true, null: false
    end
  end
end
