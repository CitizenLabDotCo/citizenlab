class CreateSpamReports < ActiveRecord::Migration[5.1]
  def change
    create_table :spam_reports, id: :uuid do |t|
      t.uuid :spam_reportable_id, null: false
      t.string :spam_reportable_type, null: false
      t.datetime :reported_at, null: false, index: true
      t.string :reason_code
      t.string :other_reason
      t.references :user, foreign_key: true, type: :uuid

      t.timestamps
    end

    add_index :spam_reports, [:spam_reportable_type, :spam_reportable_id], name: 'spam_reportable_index'
  end
end
