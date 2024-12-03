class CreateEmbeddingsSimilarities < ActiveRecord::Migration[7.0]
  def change
    enable_extension 'vector'

    create_table :embeddings_similarities, id: :uuid do |t|
      # t.column :embedding, 'shared_extensions.vector(1024)', null: false
      t.column :embedding, :vector, limit: 1024, null: false, index: true # TODO: This creates a btree index. We want a hnsw index instead.
      # t.references :idea, foreign_key: true, type: :uuid, index: true, null: false
      t.references :embeddable, polymorphic: true, type: :uuid, index: true, null: false
      t.string :context, null: true

      t.timestamps
    end
  end
end
