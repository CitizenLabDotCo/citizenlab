# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170319000059) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "uuid-ossp"

  create_table "areas", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.jsonb    "title_multiloc",       default: {}
    t.jsonb    "description_multiloc", default: {}
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
  end

  create_table "areas_ideas", id: false, force: :cascade do |t|
    t.uuid "area_id"
    t.uuid "idea_id"
    t.index ["area_id"], name: "index_areas_ideas_on_area_id", using: :btree
    t.index ["idea_id"], name: "index_areas_ideas_on_idea_id", using: :btree
  end

  create_table "areas_labs", id: false, force: :cascade do |t|
    t.uuid "area_id"
    t.uuid "lab_id"
    t.index ["area_id"], name: "index_areas_labs_on_area_id", using: :btree
    t.index ["lab_id"], name: "index_areas_labs_on_lab_id", using: :btree
  end

  create_table "ideas", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.jsonb    "title_multiloc",     default: {}
    t.jsonb    "body_multiloc",      default: {}
    t.string   "publication_status"
    t.uuid     "lab_id"
    t.uuid     "author_id"
    t.string   "author_name"
    t.jsonb    "images"
    t.jsonb    "files"
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.index ["author_id"], name: "index_ideas_on_author_id", using: :btree
    t.index ["lab_id"], name: "index_ideas_on_lab_id", using: :btree
  end

  create_table "ideas_topics", id: false, force: :cascade do |t|
    t.uuid "idea_id"
    t.uuid "topic_id"
    t.index ["idea_id"], name: "index_ideas_topics_on_idea_id", using: :btree
    t.index ["topic_id"], name: "index_ideas_topics_on_topic_id", using: :btree
  end

  create_table "labs", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.jsonb    "title_multiloc"
    t.jsonb    "description_multiloc"
    t.jsonb    "images"
    t.jsonb    "files"
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
  end

  create_table "labs_topics", id: false, force: :cascade do |t|
    t.uuid "lab_id"
    t.uuid "topic_id"
    t.index ["lab_id"], name: "index_labs_topics_on_lab_id", using: :btree
    t.index ["topic_id"], name: "index_labs_topics_on_topic_id", using: :btree
  end

  create_table "tenants", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.string   "name"
    t.string   "host"
    t.jsonb    "settings",   default: {}
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.index ["host"], name: "index_tenants_on_host", using: :btree
  end

  create_table "topics", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.jsonb    "title_multiloc",       default: {}
    t.jsonb    "description_multiloc", default: {}
    t.string   "icon"
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
  end

  create_table "users", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.string   "name"
    t.string   "email"
    t.string   "password_digest"
    t.string   "slug"
    t.jsonb    "services",        default: {}
    t.jsonb    "demographics",    default: {}
    t.jsonb    "roles",           default: []
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
    t.string   "avatar"
    t.index ["email"], name: "index_users_on_email", using: :btree
    t.index ["slug"], name: "index_users_on_slug", using: :btree
  end

  add_foreign_key "areas_ideas", "areas"
  add_foreign_key "areas_ideas", "ideas"
  add_foreign_key "areas_labs", "areas"
  add_foreign_key "areas_labs", "labs"
  add_foreign_key "ideas", "labs"
  add_foreign_key "ideas", "users", column: "author_id"
  add_foreign_key "ideas_topics", "ideas"
  add_foreign_key "ideas_topics", "topics"
  add_foreign_key "labs_topics", "labs"
  add_foreign_key "labs_topics", "topics"
end
