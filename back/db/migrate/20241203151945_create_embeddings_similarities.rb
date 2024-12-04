class CreateEmbeddingsSimilarities < ActiveRecord::Migration[7.0]
  def change
    enable_extension 'shared_extensions.vector'

    create_table :embeddings_similarities, id: :uuid do |t|
      # t.column :embedding, 'shared_extensions.vector(1024)', null: false
      t.column :embedding, :vector, limit: 1024, null: false
      t.references :embeddable, polymorphic: true, type: :uuid, null: false, index: true
      t.string :context, null: true, index: true

      t.timestamps
    end

    add_index(:embeddings_similarities, :embedding, using: 'hnsw', opclass: :vector_cosine_ops)
  end
end
