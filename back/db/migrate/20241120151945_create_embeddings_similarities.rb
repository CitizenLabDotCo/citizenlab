class CreateEmbeddingsSimilarities < ActiveRecord::Migration[7.0]
  def change
    # enable_extension 'vector'

    create_table :embeddings_similarities, id: :uuid do |t|
      t.column :embedding, 'shared_extensions.vector(1024)'
      # t.column :embedding, :vector, limit: 1024, null: true
      t.references :idea, foreign_key: true, type: :uuid, index: true, null: false

      t.timestamps
    end
  end
end
