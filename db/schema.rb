# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_02_11_144443) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"
  enable_extension "postgis"
  enable_extension "uuid-ossp"

  create_table "activities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "item_type", null: false
    t.uuid "item_id", null: false
    t.string "action", null: false
    t.jsonb "payload", default: {}, null: false
    t.uuid "user_id"
    t.datetime "acted_at", null: false
    t.datetime "created_at", null: false
    t.index ["acted_at"], name: "index_activities_on_acted_at"
    t.index ["item_type", "item_id"], name: "index_activities_on_item_type_and_item_id"
    t.index ["user_id"], name: "index_activities_on_user_id"
  end

  create_table "admin_publications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "parent_id"
    t.integer "lft", null: false
    t.integer "rgt", null: false
    t.integer "ordering"
    t.string "publication_status", default: "published", null: false
    t.uuid "publication_id"
    t.string "publication_type"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["lft"], name: "index_admin_publications_on_lft"
    t.index ["ordering"], name: "index_admin_publications_on_ordering"
    t.index ["parent_id"], name: "index_admin_publications_on_parent_id"
    t.index ["rgt"], name: "index_admin_publications_on_rgt"
  end

  create_table "app_configurations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.string "host"
    t.string "logo"
    t.string "header_bg"
    t.string "favicon"
    t.jsonb "settings", default: {}
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.jsonb "style", default: {}
  end

  create_table "areas", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.jsonb "description_multiloc", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "ordering"
  end

  create_table "areas_ideas", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.uuid "area_id"
    t.uuid "idea_id"
    t.index ["area_id"], name: "index_areas_ideas_on_area_id"
    t.index ["idea_id", "area_id"], name: "index_areas_ideas_on_idea_id_and_area_id", unique: true
    t.index ["idea_id"], name: "index_areas_ideas_on_idea_id"
  end

  create_table "areas_initiatives", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "area_id"
    t.uuid "initiative_id"
    t.index ["area_id"], name: "index_areas_initiatives_on_area_id"
    t.index ["initiative_id", "area_id"], name: "index_areas_initiatives_on_initiative_id_and_area_id", unique: true
    t.index ["initiative_id"], name: "index_areas_initiatives_on_initiative_id"
  end

  create_table "areas_projects", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.uuid "area_id"
    t.uuid "project_id"
    t.index ["area_id"], name: "index_areas_projects_on_area_id"
    t.index ["project_id"], name: "index_areas_projects_on_project_id"
  end

  create_table "baskets", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "submitted_at"
    t.uuid "user_id"
    t.uuid "participation_context_id"
    t.string "participation_context_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_baskets_on_user_id"
  end

  create_table "baskets_ideas", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "basket_id"
    t.uuid "idea_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["basket_id"], name: "index_baskets_ideas_on_basket_id"
    t.index ["idea_id"], name: "index_baskets_ideas_on_idea_id"
  end

  create_table "clusterings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.jsonb "structure", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "comments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "author_id"
    t.uuid "post_id"
    t.uuid "parent_id"
    t.integer "lft", null: false
    t.integer "rgt", null: false
    t.jsonb "body_multiloc", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "upvotes_count", default: 0, null: false
    t.integer "downvotes_count", default: 0, null: false
    t.string "publication_status", default: "published", null: false
    t.datetime "body_updated_at"
    t.integer "children_count", default: 0, null: false
    t.string "post_type"
    t.index ["author_id"], name: "index_comments_on_author_id"
    t.index ["created_at"], name: "index_comments_on_created_at"
    t.index ["lft"], name: "index_comments_on_lft"
    t.index ["parent_id"], name: "index_comments_on_parent_id"
    t.index ["post_id", "post_type"], name: "index_comments_on_post_id_and_post_type"
    t.index ["post_id"], name: "index_comments_on_post_id"
    t.index ["rgt"], name: "index_comments_on_rgt"
  end

  create_table "common_passwords", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "password"
    t.index ["password"], name: "index_common_passwords_on_password"
  end

  create_table "custom_field_options", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "custom_field_id"
    t.string "key"
    t.jsonb "title_multiloc", default: {}
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["custom_field_id", "key"], name: "index_custom_field_options_on_custom_field_id_and_key", unique: true
    t.index ["custom_field_id"], name: "index_custom_field_options_on_custom_field_id"
  end

  create_table "custom_fields", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "resource_type"
    t.string "key"
    t.string "input_type"
    t.jsonb "title_multiloc", default: {}
    t.jsonb "description_multiloc", default: {}
    t.boolean "required", default: false
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "enabled", default: true, null: false
    t.string "code"
    t.uuid "resource_id"
    t.boolean "hidden", default: false, null: false
    t.index ["resource_type", "resource_id"], name: "index_custom_fields_on_resource_type_and_resource_id"
  end

  create_table "custom_forms", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "email_campaigns_campaign_email_commands", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "campaign"
    t.uuid "recipient_id"
    t.datetime "commanded_at"
    t.jsonb "tracked_content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["recipient_id"], name: "index_email_campaigns_campaign_email_commands_on_recipient_id"
  end

  create_table "email_campaigns_campaigns", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "type", null: false
    t.uuid "author_id"
    t.boolean "enabled"
    t.string "sender"
    t.string "reply_to"
    t.jsonb "schedule", default: {}
    t.jsonb "subject_multiloc", default: {}
    t.jsonb "body_multiloc", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "deliveries_count", default: 0, null: false
    t.index ["author_id"], name: "index_email_campaigns_campaigns_on_author_id"
    t.index ["type"], name: "index_email_campaigns_campaigns_on_type"
  end

  create_table "email_campaigns_campaigns_groups", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "campaign_id"
    t.uuid "group_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["campaign_id", "group_id"], name: "index_campaigns_groups", unique: true
    t.index ["campaign_id"], name: "index_email_campaigns_campaigns_groups_on_campaign_id"
    t.index ["group_id"], name: "index_email_campaigns_campaigns_groups_on_group_id"
  end

  create_table "email_campaigns_consents", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "campaign_type", null: false
    t.uuid "user_id", null: false
    t.boolean "consented", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["campaign_type", "user_id"], name: "index_email_campaigns_consents_on_campaign_type_and_user_id", unique: true
    t.index ["user_id"], name: "index_email_campaigns_consents_on_user_id"
  end

  create_table "email_campaigns_deliveries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "campaign_id", null: false
    t.uuid "user_id", null: false
    t.string "delivery_status", null: false
    t.jsonb "tracked_content", default: {}
    t.datetime "sent_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["campaign_id", "user_id"], name: "index_email_campaigns_deliveries_on_campaign_id_and_user_id"
    t.index ["campaign_id"], name: "index_email_campaigns_deliveries_on_campaign_id"
    t.index ["sent_at"], name: "index_email_campaigns_deliveries_on_sent_at"
    t.index ["user_id"], name: "index_email_campaigns_deliveries_on_user_id"
  end

  create_table "email_campaigns_unsubscription_tokens", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "token", null: false
    t.uuid "user_id", null: false
    t.index ["token"], name: "index_email_campaigns_unsubscription_tokens_on_token"
    t.index ["user_id"], name: "index_email_campaigns_unsubscription_tokens_on_user_id"
  end

  create_table "email_snippets", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email"
    t.string "snippet"
    t.string "locale"
    t.text "body"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email", "snippet", "locale"], name: "index_email_snippets_on_email_and_snippet_and_locale"
  end

  create_table "event_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "event_id"
    t.string "file"
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.index ["event_id"], name: "index_event_files_on_event_id"
  end

  create_table "events", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id"
    t.jsonb "title_multiloc", default: {}
    t.jsonb "description_multiloc", default: {}
    t.json "location_multiloc", default: {}
    t.datetime "start_at"
    t.datetime "end_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_events_on_project_id"
  end

  create_table "groups", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.string "slug"
    t.integer "memberships_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "membership_type"
    t.jsonb "rules", default: []
    t.index ["slug"], name: "index_groups_on_slug"
  end

  create_table "groups_permissions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "permission_id", null: false
    t.uuid "group_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["group_id"], name: "index_groups_permissions_on_group_id"
    t.index ["permission_id"], name: "index_groups_permissions_on_permission_id"
  end

  create_table "groups_projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "group_id"
    t.uuid "project_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["group_id", "project_id"], name: "index_groups_projects_on_group_id_and_project_id", unique: true
    t.index ["group_id"], name: "index_groups_projects_on_group_id"
    t.index ["project_id"], name: "index_groups_projects_on_project_id"
  end

  create_table "idea_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "idea_id"
    t.string "file"
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.index ["idea_id"], name: "index_idea_files_on_idea_id"
  end

  create_table "idea_images", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "idea_id"
    t.string "image"
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["idea_id"], name: "index_idea_images_on_idea_id"
  end

  create_table "idea_statuses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.integer "ordering"
    t.string "code"
    t.string "color"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "description_multiloc", default: {}
    t.integer "ideas_count", default: 0
  end

  create_table "ideas", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.jsonb "body_multiloc", default: {}
    t.string "publication_status"
    t.datetime "published_at"
    t.uuid "project_id"
    t.uuid "author_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "upvotes_count", default: 0, null: false
    t.integer "downvotes_count", default: 0, null: false
    t.geography "location_point", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.string "location_description"
    t.integer "comments_count", default: 0, null: false
    t.uuid "idea_status_id"
    t.string "slug"
    t.integer "budget"
    t.integer "baskets_count", default: 0, null: false
    t.integer "official_feedbacks_count", default: 0, null: false
    t.uuid "assignee_id"
    t.datetime "assigned_at"
    t.integer "proposed_budget"
    t.index "((to_tsvector('simple'::regconfig, COALESCE((title_multiloc)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((body_multiloc)::text, ''::text))))", name: "index_ideas_search", using: :gin
    t.index ["author_id"], name: "index_ideas_on_author_id"
    t.index ["idea_status_id"], name: "index_ideas_on_idea_status_id"
    t.index ["location_point"], name: "index_ideas_on_location_point", using: :gist
    t.index ["project_id"], name: "index_ideas_on_project_id"
    t.index ["slug"], name: "index_ideas_on_slug", unique: true
  end

  create_table "ideas_phases", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "idea_id"
    t.uuid "phase_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["idea_id", "phase_id"], name: "index_ideas_phases_on_idea_id_and_phase_id", unique: true
    t.index ["idea_id"], name: "index_ideas_phases_on_idea_id"
    t.index ["phase_id"], name: "index_ideas_phases_on_phase_id"
  end

  create_table "ideas_topics", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.uuid "idea_id"
    t.uuid "topic_id"
    t.index ["idea_id", "topic_id"], name: "index_ideas_topics_on_idea_id_and_topic_id", unique: true
    t.index ["idea_id"], name: "index_ideas_topics_on_idea_id"
    t.index ["topic_id"], name: "index_ideas_topics_on_topic_id"
  end

  create_table "identities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "provider"
    t.string "uid"
    t.jsonb "auth_hash", default: {}
    t.uuid "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_identities_on_user_id"
  end

  create_table "initiative_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "initiative_id"
    t.string "file"
    t.string "name"
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["initiative_id"], name: "index_initiative_files_on_initiative_id"
  end

  create_table "initiative_images", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "initiative_id"
    t.string "image"
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["initiative_id"], name: "index_initiative_images_on_initiative_id"
  end

  create_table "initiative_status_changes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id"
    t.uuid "initiative_id"
    t.uuid "initiative_status_id"
    t.uuid "official_feedback_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["initiative_id"], name: "index_initiative_status_changes_on_initiative_id"
    t.index ["initiative_status_id"], name: "index_initiative_status_changes_on_initiative_status_id"
    t.index ["official_feedback_id"], name: "index_initiative_status_changes_on_official_feedback_id"
    t.index ["user_id"], name: "index_initiative_status_changes_on_user_id"
  end

  create_table "initiative_statuses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.jsonb "description_multiloc", default: {}
    t.integer "ordering"
    t.string "code"
    t.string "color"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "initiatives", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.jsonb "body_multiloc", default: {}
    t.string "publication_status"
    t.datetime "published_at"
    t.uuid "author_id"
    t.integer "upvotes_count", default: 0, null: false
    t.integer "downvotes_count", default: 0, null: false
    t.geography "location_point", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.string "location_description"
    t.string "slug"
    t.integer "comments_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "header_bg"
    t.uuid "assignee_id"
    t.integer "official_feedbacks_count", default: 0, null: false
    t.datetime "assigned_at"
    t.index "((to_tsvector('simple'::regconfig, COALESCE((title_multiloc)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((body_multiloc)::text, ''::text))))", name: "index_initiatives_search", using: :gin
    t.index ["author_id"], name: "index_initiatives_on_author_id"
    t.index ["location_point"], name: "index_initiatives_on_location_point", using: :gist
    t.index ["slug"], name: "index_initiatives_on_slug"
  end

  create_table "initiatives_topics", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "initiative_id"
    t.uuid "topic_id"
    t.index ["initiative_id", "topic_id"], name: "index_initiatives_topics_on_initiative_id_and_topic_id", unique: true
    t.index ["initiative_id"], name: "index_initiatives_topics_on_initiative_id"
    t.index ["topic_id"], name: "index_initiatives_topics_on_topic_id"
  end

  create_table "invites", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "token", null: false
    t.uuid "inviter_id"
    t.uuid "invitee_id", null: false
    t.string "invite_text"
    t.datetime "accepted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "send_invite_email", default: true, null: false
    t.index ["invitee_id"], name: "index_invites_on_invitee_id"
    t.index ["inviter_id"], name: "index_invites_on_inviter_id"
    t.index ["token"], name: "index_invites_on_token"
  end

  create_table "machine_translations_machine_translations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "translatable_id", null: false
    t.string "translatable_type", null: false
    t.string "attribute_name", null: false
    t.string "locale_to", null: false
    t.string "translation", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["translatable_id", "translatable_type", "attribute_name", "locale_to"], name: "machine_translations_lookup", unique: true
    t.index ["translatable_id", "translatable_type"], name: "machine_translations_translatable"
  end

  create_table "maps_layers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "map_config_id", null: false
    t.jsonb "title_multiloc", default: {}, null: false
    t.integer "ordering", null: false
    t.jsonb "geojson", null: false
    t.boolean "default_enabled", default: true, null: false
    t.string "marker_svg_url"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["map_config_id"], name: "index_maps_layers_on_map_config_id"
  end

  create_table "maps_legend_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "map_config_id", null: false
    t.jsonb "title_multiloc", default: {}, null: false
    t.string "color", null: false
    t.integer "ordering", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["map_config_id"], name: "index_maps_legend_items_on_map_config_id"
  end

  create_table "maps_map_configs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id", null: false
    t.geography "center", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.decimal "zoom_level", precision: 4, scale: 2
    t.string "tile_provider"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["project_id"], name: "index_maps_map_configs_on_project_id", unique: true
  end

  create_table "memberships", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "group_id"
    t.uuid "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["group_id", "user_id"], name: "index_memberships_on_group_id_and_user_id", unique: true
    t.index ["group_id"], name: "index_memberships_on_group_id"
    t.index ["user_id"], name: "index_memberships_on_user_id"
  end

  create_table "moderation_statuses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "moderatable_id"
    t.string "moderatable_type"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["moderatable_type", "moderatable_id"], name: "moderation_statuses_moderatable", unique: true
  end

  create_table "notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "type"
    t.datetime "read_at"
    t.uuid "recipient_id"
    t.uuid "post_id"
    t.uuid "comment_id"
    t.uuid "project_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "initiating_user_id"
    t.uuid "spam_report_id"
    t.uuid "invite_id"
    t.string "reason_code"
    t.string "other_reason"
    t.uuid "post_status_id"
    t.uuid "official_feedback_id"
    t.uuid "phase_id"
    t.string "post_type"
    t.string "post_status_type"
    t.index ["created_at"], name: "index_notifications_on_created_at"
    t.index ["initiating_user_id"], name: "index_notifications_on_initiating_user_id"
    t.index ["invite_id"], name: "index_notifications_on_invite_id"
    t.index ["official_feedback_id"], name: "index_notifications_on_official_feedback_id"
    t.index ["phase_id"], name: "index_notifications_on_phase_id"
    t.index ["post_id", "post_type"], name: "index_notifications_on_post_id_and_post_type"
    t.index ["post_status_id", "post_status_type"], name: "index_notifications_on_post_status_id_and_post_status_type"
    t.index ["post_status_id"], name: "index_notifications_on_post_status_id"
    t.index ["recipient_id", "read_at"], name: "index_notifications_on_recipient_id_and_read_at"
    t.index ["recipient_id"], name: "index_notifications_on_recipient_id"
    t.index ["spam_report_id"], name: "index_notifications_on_spam_report_id"
  end

  create_table "official_feedbacks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "body_multiloc", default: {}
    t.jsonb "author_multiloc", default: {}
    t.uuid "user_id"
    t.uuid "post_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "post_type"
    t.index ["post_id", "post_type"], name: "index_official_feedbacks_on_post"
    t.index ["post_id"], name: "index_official_feedbacks_on_post_id"
    t.index ["user_id"], name: "index_official_feedbacks_on_user_id"
  end

  create_table "onboarding_campaign_dismissals", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id"
    t.string "campaign_name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["campaign_name", "user_id"], name: "index_dismissals_on_campaign_name_and_user_id", unique: true
    t.index ["user_id"], name: "index_onboarding_campaign_dismissals_on_user_id"
  end

  create_table "page_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "page_id"
    t.string "file"
    t.integer "ordering"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["page_id"], name: "index_page_files_on_page_id"
  end

  create_table "page_links", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "linking_page_id", null: false
    t.uuid "linked_page_id", null: false
    t.integer "ordering"
    t.index ["linked_page_id"], name: "index_page_links_on_linked_page_id"
    t.index ["linking_page_id"], name: "index_page_links_on_linking_page_id"
  end

  create_table "pages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.jsonb "body_multiloc", default: {}
    t.string "slug"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "project_id"
    t.string "publication_status", default: "published", null: false
    t.index ["project_id"], name: "index_pages_on_project_id"
    t.index ["slug"], name: "index_pages_on_slug", unique: true
  end

  create_table "permissions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "action", null: false
    t.string "permitted_by", null: false
    t.uuid "permission_scope_id"
    t.string "permission_scope_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["action"], name: "index_permissions_on_action"
    t.index ["permission_scope_id"], name: "index_permissions_on_permission_scope_id"
  end

  create_table "phase_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "phase_id"
    t.string "file"
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.index ["phase_id"], name: "index_phase_files_on_phase_id"
  end

  create_table "phases", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id"
    t.jsonb "title_multiloc", default: {}
    t.jsonb "description_multiloc", default: {}
    t.date "start_at"
    t.date "end_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "participation_method", default: "ideation", null: false
    t.boolean "posting_enabled", default: true
    t.boolean "commenting_enabled", default: true
    t.boolean "voting_enabled", default: true
    t.string "voting_method", default: "unlimited"
    t.integer "voting_limited_max", default: 10
    t.string "survey_embed_url"
    t.string "survey_service"
    t.string "presentation_mode", default: "card"
    t.integer "max_budget"
    t.boolean "poll_anonymous", default: false, null: false
    t.boolean "downvoting_enabled", default: true, null: false
    t.integer "ideas_count", default: 0, null: false
    t.string "ideas_order"
    t.string "input_term", default: "idea"
    t.index ["project_id"], name: "index_phases_on_project_id"
  end

  create_table "polls_options", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "question_id"
    t.jsonb "title_multiloc", default: {}, null: false
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["question_id"], name: "index_polls_options_on_question_id"
  end

  create_table "polls_questions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "participation_context_id", null: false
    t.string "participation_context_type", null: false
    t.jsonb "title_multiloc", default: {}, null: false
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "question_type", default: "single_option", null: false
    t.integer "max_options"
    t.index ["participation_context_type", "participation_context_id"], name: "index_poll_questions_on_participation_context"
  end

  create_table "polls_response_options", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "response_id"
    t.uuid "option_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["option_id"], name: "index_polls_response_options_on_option_id"
    t.index ["response_id"], name: "index_polls_response_options_on_response_id"
  end

  create_table "polls_responses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "participation_context_id", null: false
    t.string "participation_context_type", null: false
    t.uuid "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["participation_context_id", "participation_context_type", "user_id"], name: "index_polls_responses_on_participation_context_and_user_id", unique: true
    t.index ["participation_context_type", "participation_context_id"], name: "index_poll_responses_on_participation_context"
    t.index ["user_id"], name: "index_polls_responses_on_user_id"
  end

  create_table "project_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id"
    t.string "file"
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.index ["project_id"], name: "index_project_files_on_project_id"
  end

  create_table "project_folders_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_folder_id"
    t.string "file"
    t.string "name"
    t.integer "ordering"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["project_folder_id"], name: "index_project_folders_files_on_project_folder_id"
  end

  create_table "project_folders_folders", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc"
    t.jsonb "description_multiloc"
    t.jsonb "description_preview_multiloc"
    t.string "header_bg"
    t.string "slug"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["slug"], name: "index_project_folders_folders_on_slug"
  end

  create_table "project_folders_images", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_folder_id"
    t.string "image"
    t.integer "ordering"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["project_folder_id"], name: "index_project_folders_images_on_project_folder_id"
  end

  create_table "project_images", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id"
    t.string "image"
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_project_images_on_project_id"
  end

  create_table "projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.jsonb "description_multiloc", default: {}
    t.string "slug"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "header_bg"
    t.integer "ideas_count", default: 0, null: false
    t.string "visible_to", default: "public", null: false
    t.jsonb "description_preview_multiloc", default: {}
    t.string "presentation_mode", default: "card"
    t.string "participation_method", default: "ideation"
    t.boolean "posting_enabled", default: true
    t.boolean "commenting_enabled", default: true
    t.boolean "voting_enabled", default: true
    t.string "voting_method", default: "unlimited"
    t.integer "voting_limited_max", default: 10
    t.string "process_type", default: "timeline", null: false
    t.string "internal_role"
    t.string "survey_embed_url"
    t.string "survey_service"
    t.integer "max_budget"
    t.integer "comments_count", default: 0, null: false
    t.uuid "default_assignee_id"
    t.boolean "poll_anonymous", default: false, null: false
    t.uuid "custom_form_id"
    t.boolean "downvoting_enabled", default: true, null: false
    t.string "ideas_order"
    t.string "input_term", default: "idea"
    t.index ["custom_form_id"], name: "index_projects_on_custom_form_id"
    t.index ["slug"], name: "index_projects_on_slug", unique: true
  end

  create_table "projects_topics", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.uuid "project_id"
    t.uuid "topic_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "ordering"
    t.index ["project_id"], name: "index_projects_topics_on_project_id"
    t.index ["topic_id"], name: "index_projects_topics_on_topic_id"
  end

  create_table "public_api_api_clients", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.string "secret"
    t.uuid "tenant_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id"], name: "index_public_api_api_clients_on_tenant_id"
  end

  create_table "que_jobs", comment: "4", force: :cascade do |t|
    t.integer "priority", limit: 2, default: 100, null: false
    t.datetime "run_at", default: -> { "now()" }, null: false
    t.text "job_class", null: false
    t.integer "error_count", default: 0, null: false
    t.text "last_error_message"
    t.text "queue", default: "default", null: false
    t.text "last_error_backtrace"
    t.datetime "finished_at"
    t.datetime "expired_at"
    t.jsonb "args", default: [], null: false
    t.jsonb "data", default: {}, null: false
    t.index ["args"], name: "que_jobs_args_gin_idx", opclass: :jsonb_path_ops, using: :gin
    t.index ["data"], name: "que_jobs_data_gin_idx", opclass: :jsonb_path_ops, using: :gin
    t.index ["queue", "priority", "run_at", "id"], name: "que_poll_idx", where: "((finished_at IS NULL) AND (expired_at IS NULL))"
  end

  create_table "que_lockers", primary_key: "pid", id: :integer, default: nil, force: :cascade do |t|
    t.integer "worker_count", null: false
    t.integer "worker_priorities", null: false, array: true
    t.integer "ruby_pid", null: false
    t.text "ruby_hostname", null: false
    t.text "queues", null: false, array: true
    t.boolean "listening", null: false
  end

  create_table "que_values", primary_key: "key", id: :text, force: :cascade do |t|
    t.jsonb "value", default: {}, null: false
  end

  create_table "spam_reports", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "spam_reportable_id", null: false
    t.string "spam_reportable_type", null: false
    t.datetime "reported_at", null: false
    t.string "reason_code"
    t.string "other_reason"
    t.uuid "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["reported_at"], name: "index_spam_reports_on_reported_at"
    t.index ["spam_reportable_type", "spam_reportable_id"], name: "spam_reportable_index"
    t.index ["user_id"], name: "index_spam_reports_on_user_id"
  end

  create_table "surveys_responses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "participation_context_id", null: false
    t.string "participation_context_type", null: false
    t.string "survey_service", null: false
    t.string "external_survey_id", null: false
    t.string "external_response_id", null: false
    t.uuid "user_id"
    t.datetime "started_at"
    t.datetime "submitted_at", null: false
    t.jsonb "answers", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["participation_context_type", "participation_context_id"], name: "index_surveys_responses_on_participation_context"
    t.index ["user_id"], name: "index_surveys_responses_on_user_id"
  end

  create_table "tagging_pending_tasks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "nlp_task_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "tagging_pending_tasks_ideas", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "idea_id"
    t.uuid "pending_task_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["idea_id"], name: "index_tagging_pending_tasks_ideas_on_idea_id"
    t.index ["pending_task_id"], name: "index_tagging_pending_tasks_ideas_on_pending_task_id"
  end

  create_table "tagging_pending_tasks_tags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tag_id"
    t.uuid "pending_task_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["pending_task_id"], name: "index_tagging_pending_tasks_tags_on_pending_task_id"
    t.index ["tag_id"], name: "index_tagging_pending_tasks_tags_on_tag_id"
  end

  create_table "tagging_taggings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.integer "assignment_method", default: 0
    t.uuid "idea_id"
    t.uuid "tag_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.float "confidence_score"
    t.index ["idea_id", "tag_id"], name: "index_tagging_taggings_on_idea_id_and_tag_id", unique: true
    t.index ["idea_id"], name: "index_tagging_taggings_on_idea_id"
    t.index ["tag_id"], name: "index_tagging_taggings_on_tag_id"
  end

  create_table "tagging_tags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tenants", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.string "host"
    t.jsonb "settings", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "logo"
    t.string "header_bg"
    t.string "favicon"
    t.jsonb "style", default: {}
    t.index ["host"], name: "index_tenants_on_host"
  end

  create_table "text_images", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "imageable_type", null: false
    t.uuid "imageable_id", null: false
    t.string "imageable_field"
    t.string "image"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "text_reference", null: false
  end

  create_table "topics", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.jsonb "description_multiloc", default: {}
    t.string "icon"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "ordering"
    t.string "code", default: "custom", null: false
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.string "slug"
    t.jsonb "roles", default: []
    t.string "reset_password_token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "avatar"
    t.string "first_name"
    t.string "last_name"
    t.string "locale"
    t.jsonb "bio_multiloc", default: {}
    t.boolean "cl1_migrated", default: false
    t.string "invite_status"
    t.jsonb "custom_field_values", default: {}
    t.datetime "registration_completed_at"
    t.boolean "verified", default: false, null: false
    t.index "lower((email)::text)", name: "users_unique_lower_email_idx", unique: true
    t.index ["email"], name: "index_users_on_email"
    t.index ["slug"], name: "index_users_on_slug", unique: true
  end

  create_table "verification_id_cards", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "hashed_card_id"
    t.index ["hashed_card_id"], name: "index_verification_id_cards_on_hashed_card_id"
  end

  create_table "verification_verifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id"
    t.string "method_name", null: false
    t.string "hashed_uid", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["hashed_uid"], name: "index_verification_verifications_on_hashed_uid"
    t.index ["user_id"], name: "index_verification_verifications_on_user_id"
  end

  create_table "volunteering_causes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "participation_context_id", null: false
    t.string "participation_context_type", null: false
    t.jsonb "title_multiloc", default: {}, null: false
    t.jsonb "description_multiloc", default: {}, null: false
    t.integer "volunteers_count", default: 0, null: false
    t.string "image"
    t.integer "ordering", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["ordering"], name: "index_volunteering_causes_on_ordering"
    t.index ["participation_context_type", "participation_context_id"], name: "index_volunteering_causes_on_participation_context"
  end

  create_table "volunteering_volunteers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "cause_id", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["cause_id"], name: "index_volunteering_volunteers_on_cause_id"
    t.index ["user_id"], name: "index_volunteering_volunteers_on_user_id"
  end

  create_table "votes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "votable_id"
    t.string "votable_type"
    t.uuid "user_id"
    t.string "mode", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_votes_on_user_id"
    t.index ["votable_type", "votable_id", "user_id"], name: "index_votes_on_votable_type_and_votable_id_and_user_id", unique: true
    t.index ["votable_type", "votable_id"], name: "index_votes_on_votable_type_and_votable_id"
  end

  add_foreign_key "activities", "users"
  add_foreign_key "areas_ideas", "areas"
  add_foreign_key "areas_ideas", "ideas"
  add_foreign_key "areas_initiatives", "areas"
  add_foreign_key "areas_initiatives", "initiatives"
  add_foreign_key "areas_projects", "areas"
  add_foreign_key "areas_projects", "projects"
  add_foreign_key "baskets", "users"
  add_foreign_key "baskets_ideas", "baskets"
  add_foreign_key "baskets_ideas", "ideas"
  add_foreign_key "comments", "users", column: "author_id"
  add_foreign_key "custom_field_options", "custom_fields"
  add_foreign_key "email_campaigns_campaign_email_commands", "users", column: "recipient_id"
  add_foreign_key "email_campaigns_campaigns", "users", column: "author_id"
  add_foreign_key "email_campaigns_campaigns_groups", "email_campaigns_campaigns", column: "campaign_id"
  add_foreign_key "email_campaigns_deliveries", "email_campaigns_campaigns", column: "campaign_id"
  add_foreign_key "event_files", "events"
  add_foreign_key "events", "projects"
  add_foreign_key "groups_permissions", "groups"
  add_foreign_key "groups_permissions", "permissions"
  add_foreign_key "groups_projects", "groups"
  add_foreign_key "groups_projects", "projects"
  add_foreign_key "idea_files", "ideas"
  add_foreign_key "idea_images", "ideas"
  add_foreign_key "ideas", "idea_statuses"
  add_foreign_key "ideas", "projects"
  add_foreign_key "ideas", "users", column: "assignee_id"
  add_foreign_key "ideas", "users", column: "author_id"
  add_foreign_key "ideas_phases", "ideas"
  add_foreign_key "ideas_phases", "phases"
  add_foreign_key "ideas_topics", "ideas"
  add_foreign_key "ideas_topics", "topics"
  add_foreign_key "identities", "users"
  add_foreign_key "initiative_files", "initiatives"
  add_foreign_key "initiative_images", "initiatives"
  add_foreign_key "initiatives", "users", column: "assignee_id"
  add_foreign_key "initiatives", "users", column: "author_id"
  add_foreign_key "initiatives_topics", "initiatives"
  add_foreign_key "initiatives_topics", "topics"
  add_foreign_key "invites", "users", column: "invitee_id"
  add_foreign_key "invites", "users", column: "inviter_id"
  add_foreign_key "maps_layers", "maps_map_configs", column: "map_config_id"
  add_foreign_key "maps_legend_items", "maps_map_configs", column: "map_config_id"
  add_foreign_key "memberships", "groups"
  add_foreign_key "memberships", "users"
  add_foreign_key "notifications", "comments"
  add_foreign_key "notifications", "invites"
  add_foreign_key "notifications", "official_feedbacks"
  add_foreign_key "notifications", "phases"
  add_foreign_key "notifications", "projects"
  add_foreign_key "notifications", "spam_reports"
  add_foreign_key "notifications", "users", column: "initiating_user_id"
  add_foreign_key "notifications", "users", column: "recipient_id"
  add_foreign_key "official_feedbacks", "users"
  add_foreign_key "page_files", "pages"
  add_foreign_key "page_links", "pages", column: "linked_page_id"
  add_foreign_key "page_links", "pages", column: "linking_page_id"
  add_foreign_key "pages", "projects"
  add_foreign_key "phase_files", "phases"
  add_foreign_key "phases", "projects"
  add_foreign_key "polls_options", "polls_questions", column: "question_id"
  add_foreign_key "polls_response_options", "polls_options", column: "option_id"
  add_foreign_key "polls_response_options", "polls_responses", column: "response_id"
  add_foreign_key "project_files", "projects"
  add_foreign_key "project_folders_files", "project_folders_folders", column: "project_folder_id"
  add_foreign_key "project_folders_images", "project_folders_folders", column: "project_folder_id"
  add_foreign_key "project_images", "projects"
  add_foreign_key "projects", "users", column: "default_assignee_id"
  add_foreign_key "projects_topics", "projects"
  add_foreign_key "projects_topics", "topics"
  add_foreign_key "public_api_api_clients", "tenants"
  add_foreign_key "spam_reports", "users"
  add_foreign_key "tagging_pending_tasks_ideas", "ideas"
  add_foreign_key "tagging_pending_tasks_ideas", "tagging_pending_tasks", column: "pending_task_id"
  add_foreign_key "tagging_pending_tasks_tags", "tagging_pending_tasks", column: "pending_task_id"
  add_foreign_key "tagging_pending_tasks_tags", "tagging_tags", column: "tag_id"
  add_foreign_key "tagging_taggings", "ideas"
  add_foreign_key "tagging_taggings", "tagging_tags", column: "tag_id"
  add_foreign_key "volunteering_volunteers", "volunteering_causes", column: "cause_id"
  add_foreign_key "votes", "users"

  create_view "idea_trending_infos", sql_definition: <<-SQL
      SELECT ideas.id AS idea_id,
      GREATEST(comments_at.last_comment_at, upvotes_at.last_upvoted_at, ideas.published_at) AS last_activity_at,
      to_timestamp(round((((GREATEST(((comments_at.comments_count)::double precision * comments_at.mean_comment_at), (0)::double precision) + GREATEST(((upvotes_at.upvotes_count)::double precision * upvotes_at.mean_upvoted_at), (0)::double precision)) + date_part('epoch'::text, ideas.published_at)) / (((GREATEST((comments_at.comments_count)::numeric, 0.0) + GREATEST((upvotes_at.upvotes_count)::numeric, 0.0)) + 1.0))::double precision))) AS mean_activity_at
     FROM ((ideas
       FULL JOIN ( SELECT comments.post_id AS idea_id,
              max(comments.created_at) AS last_comment_at,
              avg(date_part('epoch'::text, comments.created_at)) AS mean_comment_at,
              count(comments.post_id) AS comments_count
             FROM comments
            GROUP BY comments.post_id) comments_at ON ((ideas.id = comments_at.idea_id)))
       FULL JOIN ( SELECT votes.votable_id,
              max(votes.created_at) AS last_upvoted_at,
              avg(date_part('epoch'::text, votes.created_at)) AS mean_upvoted_at,
              count(votes.votable_id) AS upvotes_count
             FROM votes
            WHERE (((votes.mode)::text = 'up'::text) AND ((votes.votable_type)::text = 'Idea'::text))
            GROUP BY votes.votable_id) upvotes_at ON ((ideas.id = upvotes_at.votable_id)));
  SQL
  create_view "initiative_initiative_statuses", sql_definition: <<-SQL
      SELECT initiative_status_changes.initiative_id,
      initiative_status_changes.initiative_status_id
     FROM (((initiatives
       JOIN ( SELECT initiative_status_changes_1.initiative_id,
              max(initiative_status_changes_1.created_at) AS last_status_changed_at
             FROM initiative_status_changes initiative_status_changes_1
            GROUP BY initiative_status_changes_1.initiative_id) initiatives_with_last_status_change ON ((initiatives.id = initiatives_with_last_status_change.initiative_id)))
       JOIN initiative_status_changes ON (((initiatives.id = initiative_status_changes.initiative_id) AND (initiatives_with_last_status_change.last_status_changed_at = initiative_status_changes.created_at))))
       JOIN initiative_statuses ON ((initiative_statuses.id = initiative_status_changes.initiative_status_id)));
  SQL
  create_view "moderations", sql_definition: <<-SQL
      SELECT ideas.id,
      'Idea'::text AS moderatable_type,
      NULL::text AS post_type,
      NULL::uuid AS post_id,
      NULL::text AS post_slug,
      NULL::jsonb AS post_title_multiloc,
      projects.id AS project_id,
      projects.slug AS project_slug,
      projects.title_multiloc AS project_title_multiloc,
      ideas.title_multiloc AS content_title_multiloc,
      ideas.body_multiloc AS content_body_multiloc,
      ideas.slug AS content_slug,
      ideas.published_at AS created_at,
      moderation_statuses.status AS moderation_status
     FROM ((ideas
       LEFT JOIN moderation_statuses ON ((moderation_statuses.moderatable_id = ideas.id)))
       LEFT JOIN projects ON ((projects.id = ideas.project_id)))
  UNION ALL
   SELECT initiatives.id,
      'Initiative'::text AS moderatable_type,
      NULL::text AS post_type,
      NULL::uuid AS post_id,
      NULL::text AS post_slug,
      NULL::jsonb AS post_title_multiloc,
      NULL::uuid AS project_id,
      NULL::character varying AS project_slug,
      NULL::jsonb AS project_title_multiloc,
      initiatives.title_multiloc AS content_title_multiloc,
      initiatives.body_multiloc AS content_body_multiloc,
      initiatives.slug AS content_slug,
      initiatives.published_at AS created_at,
      moderation_statuses.status AS moderation_status
     FROM (initiatives
       LEFT JOIN moderation_statuses ON ((moderation_statuses.moderatable_id = initiatives.id)))
  UNION ALL
   SELECT comments.id,
      'Comment'::text AS moderatable_type,
      'Idea'::text AS post_type,
      ideas.id AS post_id,
      ideas.slug AS post_slug,
      ideas.title_multiloc AS post_title_multiloc,
      projects.id AS project_id,
      projects.slug AS project_slug,
      projects.title_multiloc AS project_title_multiloc,
      NULL::jsonb AS content_title_multiloc,
      comments.body_multiloc AS content_body_multiloc,
      NULL::character varying AS content_slug,
      comments.created_at,
      moderation_statuses.status AS moderation_status
     FROM (((comments
       LEFT JOIN moderation_statuses ON ((moderation_statuses.moderatable_id = comments.id)))
       LEFT JOIN ideas ON ((ideas.id = comments.post_id)))
       LEFT JOIN projects ON ((projects.id = ideas.project_id)))
    WHERE ((comments.post_type)::text = 'Idea'::text)
  UNION ALL
   SELECT comments.id,
      'Comment'::text AS moderatable_type,
      'Initiative'::text AS post_type,
      initiatives.id AS post_id,
      initiatives.slug AS post_slug,
      initiatives.title_multiloc AS post_title_multiloc,
      NULL::uuid AS project_id,
      NULL::character varying AS project_slug,
      NULL::jsonb AS project_title_multiloc,
      NULL::jsonb AS content_title_multiloc,
      comments.body_multiloc AS content_body_multiloc,
      NULL::character varying AS content_slug,
      comments.created_at,
      moderation_statuses.status AS moderation_status
     FROM ((comments
       LEFT JOIN moderation_statuses ON ((moderation_statuses.moderatable_id = comments.id)))
       LEFT JOIN initiatives ON ((initiatives.id = comments.post_id)))
    WHERE ((comments.post_type)::text = 'Initiative'::text);
  SQL
  create_view "union_posts", sql_definition: <<-SQL
      SELECT ideas.id,
      ideas.title_multiloc,
      ideas.body_multiloc,
      ideas.publication_status,
      ideas.published_at,
      ideas.author_id,
      ideas.created_at,
      ideas.updated_at,
      ideas.upvotes_count,
      ideas.location_point,
      ideas.location_description,
      ideas.comments_count,
      ideas.slug,
      ideas.official_feedbacks_count
     FROM ideas
  UNION ALL
   SELECT initiatives.id,
      initiatives.title_multiloc,
      initiatives.body_multiloc,
      initiatives.publication_status,
      initiatives.published_at,
      initiatives.author_id,
      initiatives.created_at,
      initiatives.updated_at,
      initiatives.upvotes_count,
      initiatives.location_point,
      initiatives.location_description,
      initiatives.comments_count,
      initiatives.slug,
      initiatives.official_feedbacks_count
     FROM initiatives;
  SQL
end
