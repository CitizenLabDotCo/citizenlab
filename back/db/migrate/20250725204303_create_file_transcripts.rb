class CreateFileTranscripts < ActiveRecord::Migration[7.1]
  def change
    create_table :files_transcripts, id: :uuid do |t|
      t.references :file, null: false, foreign_key: true, type: :uuid, index: { unique: true }
      t.string :status, null: false, default: 'pending'
      t.string :assemblyai_id
      t.jsonb :assemblyai_transcript
      t.string :error_message
      t.timestamps
    end

    add_index :files_transcripts, :status
  end
end
