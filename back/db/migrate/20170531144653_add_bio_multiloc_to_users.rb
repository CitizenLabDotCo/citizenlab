class AddBioMultilocToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :bio_multiloc, :jsonb, default: {}
  end
end
