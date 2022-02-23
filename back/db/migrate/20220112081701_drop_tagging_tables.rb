class DropTaggingTables < ActiveRecord::Migration[6.1]
  def change
    remove_foreign_key 'tagging_pending_tasks_ideas', 'ideas'
    remove_foreign_key 'tagging_pending_tasks_ideas', 'tagging_pending_tasks', column: 'pending_task_id'
    remove_foreign_key 'tagging_pending_tasks_tags', 'tagging_pending_tasks', column: 'pending_task_id'
    remove_foreign_key 'tagging_pending_tasks_tags', 'tagging_tags', column: 'tag_id'
    remove_foreign_key 'tagging_taggings', 'ideas'
    remove_foreign_key 'tagging_taggings', 'tagging_tags', column: 'tag_id'

    drop_table 'tagging_pending_tasks', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.string 'nlp_task_id', null: false
      t.datetime 'created_at', precision: 6, null: false
      t.datetime 'updated_at', precision: 6, null: false
    end

    drop_table 'tagging_pending_tasks_ideas', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.uuid 'idea_id'
      t.uuid 'pending_task_id'
      t.datetime 'created_at', precision: 6, null: false
      t.datetime 'updated_at', precision: 6, null: false
      t.index ['idea_id'], name: 'index_tagging_pending_tasks_ideas_on_idea_id'
      t.index ['pending_task_id'], name: 'index_tagging_pending_tasks_ideas_on_pending_task_id'
    end

    drop_table 'tagging_pending_tasks_tags', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.uuid 'tag_id'
      t.uuid 'pending_task_id'
      t.datetime 'created_at', precision: 6, null: false
      t.datetime 'updated_at', precision: 6, null: false
      t.index ['pending_task_id'], name: 'index_tagging_pending_tasks_tags_on_pending_task_id'
      t.index ['tag_id'], name: 'index_tagging_pending_tasks_tags_on_tag_id'
    end

    drop_table 'tagging_taggings', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.integer 'assignment_method', default: 0
      t.uuid 'idea_id'
      t.uuid 'tag_id'
      t.datetime 'created_at', null: false
      t.datetime 'updated_at', null: false
      t.float 'confidence_score'
      t.index %w[idea_id tag_id], name: 'index_tagging_taggings_on_idea_id_and_tag_id', unique: true
      t.index ['idea_id'], name: 'index_tagging_taggings_on_idea_id'
      t.index ['tag_id'], name: 'index_tagging_taggings_on_tag_id'
    end

    drop_table 'tagging_tags', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.jsonb 'title_multiloc', default: {}
      t.datetime 'created_at', null: false
      t.datetime 'updated_at', null: false
    end
  end
end
