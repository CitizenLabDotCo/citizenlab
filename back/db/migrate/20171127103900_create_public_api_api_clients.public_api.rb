# frozen_string_literal: true

# This migration comes from public_api (originally 20171109172144)
class CreatePublicApiApiClients < ActiveRecord::Migration[5.1]
  def change
    create_table :public_api_api_clients, id: :uuid do |t|
      t.string :name
      t.string :secret
      t.references :tenant, foreign_key: true, type: :uuid

      t.timestamps
    end
  end
end
