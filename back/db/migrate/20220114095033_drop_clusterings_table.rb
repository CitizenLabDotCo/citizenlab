# frozen_string_literal: true

class DropClusteringsTable < ActiveRecord::Migration[6.1]
  def change
    drop_table 'clusterings', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.jsonb 'title_multiloc', default: {}
      t.jsonb 'structure', default: {}
      t.datetime 'created_at', null: false
      t.datetime 'updated_at', null: false
    end
  end
end
