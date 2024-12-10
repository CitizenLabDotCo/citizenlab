class EnableVectorExtension < ActiveRecord::Migration[7.0]
  def change
    execute 'CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA shared_extensions'
  end
end
