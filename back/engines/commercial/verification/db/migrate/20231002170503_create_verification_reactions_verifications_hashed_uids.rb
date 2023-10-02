# frozen_string_literal: true

class CreateVerificationReactionsVerificationsHashedUids < ActiveRecord::Migration[7.0]
  def change
    create_table :verification_reactions_verifications_hashed_uids, id: :uuid do |t|
      t.references :reaction, foreign_key: true, type: :uuid, index: { name: 'index_on_reaction_id' }
      t.string :verification_hashed_uid, index: { name: 'index_on_verification_hashed_uid' }
      t.timestamps
    end
  end
end
