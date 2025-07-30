class CreateFileTranscripts < ActiveRecord::Migration[7.1]
  def change
    create_table :files_transcripts, id: :uuid do |t|
      t.references :file, null: false, foreign_key: true, type: :uuid, index: { unique: true }
      t.string :status, null: false, default: 'pending'
      t.string :assemblyai_id
      t.text :text
      t.float :confidence
      t.string :language_code
      t.jsonb :words, default: []
      t.jsonb :utterances, default: []
      t.jsonb :metadata, default: {}
      t.jsonb :features, default: {}
      t.string :error_message
      t.timestamps
    end

    add_index :files_transcripts, :status
  end
end
