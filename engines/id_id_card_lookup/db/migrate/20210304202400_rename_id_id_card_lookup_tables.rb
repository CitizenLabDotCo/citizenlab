class RenameIdIdCardLookupTables < ActiveRecord::Migration[6.0]
  def change
    rename_table :verification_id_cards, :id_id_card_lookup_id_cards
  end
end
