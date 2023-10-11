# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2023_09_27_135924) do
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
    t.datetime "acted_at", precision: nil, null: false
    t.datetime "created_at", precision: nil, null: false
    t.uuid "project_id"
    t.index ["acted_at"], name: "index_activities_on_acted_at"
    t.index ["action"], name: "index_activities_on_action"
    t.index ["item_type", "item_id"], name: "index_activities_on_item"
    t.index ["project_id"], name: "index_activities_on_project_id"
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
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "depth", default: 0, null: false
    t.boolean "children_allowed", default: true, null: false
    t.integer "children_count", default: 0, null: false
    t.index ["depth"], name: "index_admin_publications_on_depth"
    t.index ["lft"], name: "index_admin_publications_on_lft"
    t.index ["ordering"], name: "index_admin_publications_on_ordering"
    t.index ["parent_id"], name: "index_admin_publications_on_parent_id"
    t.index ["publication_type", "publication_id"], name: "index_admin_publications_on_publication_type_and_publication_id"
    t.index ["rgt"], name: "index_admin_publications_on_rgt"
  end

  create_table "analysis_analyses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id"
    t.uuid "phase_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["phase_id"], name: "index_analysis_analyses_on_phase_id"
    t.index ["project_id"], name: "index_analysis_analyses_on_project_id"
  end

  create_table "analysis_analyses_custom_fields", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "analysis_id"
    t.uuid "custom_field_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["analysis_id", "custom_field_id"], name: "index_analysis_analyses_custom_fields", unique: true
    t.index ["analysis_id"], name: "index_analysis_analyses_custom_fields_on_analysis_id"
    t.index ["custom_field_id"], name: "index_analysis_analyses_custom_fields_on_custom_field_id"
  end

  create_table "analysis_background_tasks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "analysis_id", null: false
    t.string "type", null: false
    t.string "state", null: false
    t.float "progress"
    t.datetime "started_at"
    t.datetime "ended_at"
    t.string "auto_tagging_method"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "tags_ids"
    t.jsonb "filters", default: {}, null: false
    t.index ["analysis_id"], name: "index_analysis_background_tasks_on_analysis_id"
  end

  create_table "analysis_insights", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "analysis_id", null: false
    t.string "insightable_type", null: false
    t.uuid "insightable_id", null: false
    t.jsonb "filters", default: {}, null: false
    t.jsonb "inputs_ids"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "bookmarked", default: false, null: false
    t.index ["analysis_id"], name: "index_analysis_insights_on_analysis_id"
    t.index ["insightable_type", "insightable_id"], name: "index_analysis_insights_on_insightable"
  end

  create_table "analysis_questions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "background_task_id", null: false
    t.text "question"
    t.text "answer"
    t.text "prompt"
    t.string "q_and_a_method", null: false
    t.float "accuracy"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["background_task_id"], name: "index_analysis_questions_on_background_task_id"
  end

  create_table "analysis_summaries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "background_task_id", null: false
    t.text "summary"
    t.text "prompt"
    t.string "summarization_method", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.float "accuracy"
    t.index ["background_task_id"], name: "index_analysis_summaries_on_background_task_id"
  end

  create_table "analysis_taggings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tag_id", null: false
    t.uuid "input_id", null: false
    t.uuid "background_task_id"
    t.index ["input_id"], name: "index_analysis_taggings_on_input_id"
    t.index ["tag_id", "input_id"], name: "index_analysis_taggings_on_tag_id_and_input_id", unique: true
    t.index ["tag_id"], name: "index_analysis_taggings_on_tag_id"
  end

  create_table "analysis_tags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "tag_type", null: false
    t.uuid "analysis_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["analysis_id", "name"], name: "index_analysis_tags_on_analysis_id_and_name", unique: true
    t.index ["analysis_id"], name: "index_analysis_tags_on_analysis_id"
  end

  create_table "analytics_dimension_dates", primary_key: "date", id: :date, force: :cascade do |t|
    t.string "year"
    t.string "month"
    t.date "week"
  end

  create_table "analytics_dimension_locales", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.index ["name"], name: "index_analytics_dimension_locales_on_name", unique: true
  end

  create_table "analytics_dimension_locales_fact_visits", id: false, force: :cascade do |t|
    t.uuid "dimension_locale_id"
    t.uuid "fact_visit_id"
    t.index ["dimension_locale_id", "fact_visit_id"], name: "i_analytics_dim_locales_fact_visits_on_locale_and_visit_ids", unique: true
    t.index ["dimension_locale_id"], name: "i_l_v_locale"
    t.index ["fact_visit_id"], name: "i_l_v_visit"
  end

  create_table "analytics_dimension_projects_fact_visits", id: false, force: :cascade do |t|
    t.uuid "dimension_project_id"
    t.uuid "fact_visit_id"
    t.index ["dimension_project_id", "fact_visit_id"], name: "i_analytics_dim_projects_fact_visits_on_project_and_visit_ids", unique: true
    t.index ["dimension_project_id"], name: "i_p_v_project"
    t.index ["fact_visit_id"], name: "i_p_v_visit"
  end

  create_table "analytics_dimension_referrer_types", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "key", null: false
    t.string "name", null: false
    t.index ["key"], name: "i_d_referrer_key", unique: true
  end

  create_table "analytics_dimension_types", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.string "parent"
    t.index ["name", "parent"], name: "index_analytics_dimension_types_on_name_and_parent", unique: true
  end

  create_table "analytics_fact_visits", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "visitor_id", null: false
    t.uuid "dimension_user_id"
    t.uuid "dimension_referrer_type_id", null: false
    t.date "dimension_date_first_action_id", null: false
    t.date "dimension_date_last_action_id", null: false
    t.integer "duration", null: false
    t.integer "pages_visited", null: false
    t.boolean "returning_visitor", default: false, null: false
    t.string "referrer_name"
    t.string "referrer_url"
    t.integer "matomo_visit_id", null: false
    t.datetime "matomo_last_action_time", precision: nil, null: false
    t.index ["dimension_date_first_action_id"], name: "i_v_first_action"
    t.index ["dimension_date_last_action_id"], name: "i_v_last_action"
    t.index ["dimension_referrer_type_id"], name: "i_v_referrer_type"
    t.index ["dimension_user_id"], name: "i_v_user"
    t.index ["matomo_last_action_time"], name: "i_v_timestamp"
    t.index ["matomo_visit_id"], name: "i_v_matomo_visit", unique: true
  end

  create_table "app_configurations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.string "host"
    t.string "logo"
    t.string "favicon"
    t.jsonb "settings", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "style", default: {}
  end

  create_table "areas", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.jsonb "description_multiloc", default: {}
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "ordering"
    t.uuid "custom_field_option_id"
    t.integer "followers_count", default: 0, null: false
    t.boolean "include_in_onboarding", default: false, null: false
    t.index ["custom_field_option_id"], name: "index_areas_on_custom_field_option_id"
    t.index ["include_in_onboarding"], name: "index_areas_on_include_in_onboarding"
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

  create_table "areas_static_pages", force: :cascade do |t|
    t.uuid "area_id", null: false
    t.uuid "static_page_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["area_id"], name: "index_areas_static_pages_on_area_id"
    t.index ["static_page_id"], name: "index_areas_static_pages_on_static_page_id"
  end

  create_table "baskets", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "submitted_at", precision: nil
    t.uuid "user_id"
    t.uuid "participation_context_id"
    t.string "participation_context_type"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["submitted_at"], name: "index_baskets_on_submitted_at"
    t.index ["user_id"], name: "index_baskets_on_user_id"
  end

  create_table "baskets_ideas", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "basket_id"
    t.uuid "idea_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "votes", default: 1, null: false
    t.index ["basket_id", "idea_id"], name: "index_baskets_ideas_on_basket_id_and_idea_id", unique: true
    t.index ["idea_id"], name: "index_baskets_ideas_on_idea_id"
  end

  create_table "comments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "author_id"
    t.uuid "post_id"
    t.uuid "parent_id"
    t.integer "lft", null: false
    t.integer "rgt", null: false
    t.jsonb "body_multiloc", default: {}
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "likes_count", default: 0, null: false
    t.integer "dislikes_count", default: 0, null: false
    t.string "publication_status", default: "published", null: false
    t.datetime "body_updated_at", precision: nil
    t.integer "children_count", default: 0, null: false
    t.string "post_type"
    t.string "author_hash"
    t.boolean "anonymous", default: false, null: false
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

  create_table "content_builder_layout_images", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "image"
    t.string "code"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "content_builder_layouts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "craftjs_jsonmultiloc", default: {}
    t.string "content_buildable_type", null: false
    t.uuid "content_buildable_id", null: false
    t.string "code", null: false
    t.boolean "enabled", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["content_buildable_type", "content_buildable_id", "code"], name: "index_content_builder_layouts_content_buidable_type_id_code", unique: true
  end

  create_table "cosponsors_initiatives", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "status", default: "pending", null: false
    t.uuid "user_id", null: false
    t.uuid "initiative_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["initiative_id"], name: "index_cosponsors_initiatives_on_initiative_id"
    t.index ["user_id"], name: "index_cosponsors_initiatives_on_user_id"
  end

  create_table "custom_field_options", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "custom_field_id"
    t.string "key"
    t.jsonb "title_multiloc", default: {}
    t.integer "ordering"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
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
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "enabled", default: true, null: false
    t.string "code"
    t.uuid "resource_id"
    t.boolean "hidden", default: false, null: false
    t.integer "maximum"
    t.jsonb "minimum_label_multiloc", default: {}, null: false
    t.jsonb "maximum_label_multiloc", default: {}, null: false
    t.jsonb "logic", default: {}, null: false
    t.string "answer_visible_to"
    t.boolean "select_count_enabled", default: false, null: false
    t.integer "maximum_select_count"
    t.integer "minimum_select_count"
    t.index ["resource_type", "resource_id"], name: "index_custom_fields_on_resource_type_and_resource_id"
  end

  create_table "custom_forms", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "participation_context_id", null: false
    t.string "participation_context_type", null: false
    t.index ["participation_context_id", "participation_context_type"], name: "index_custom_forms_on_participation_context", unique: true
  end

  create_table "email_campaigns_campaign_email_commands", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "campaign"
    t.uuid "recipient_id"
    t.datetime "commanded_at", precision: nil
    t.jsonb "tracked_content"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
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
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "deliveries_count", default: 0, null: false
    t.index ["author_id"], name: "index_email_campaigns_campaigns_on_author_id"
    t.index ["type"], name: "index_email_campaigns_campaigns_on_type"
  end

  create_table "email_campaigns_campaigns_groups", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "campaign_id"
    t.uuid "group_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["campaign_id", "group_id"], name: "index_campaigns_groups", unique: true
    t.index ["campaign_id"], name: "index_email_campaigns_campaigns_groups_on_campaign_id"
    t.index ["group_id"], name: "index_email_campaigns_campaigns_groups_on_group_id"
  end

  create_table "email_campaigns_consents", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "campaign_type", null: false
    t.uuid "user_id", null: false
    t.boolean "consented", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["campaign_type", "user_id"], name: "index_email_campaigns_consents_on_campaign_type_and_user_id", unique: true
    t.index ["user_id"], name: "index_email_campaigns_consents_on_user_id"
  end

  create_table "email_campaigns_deliveries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "campaign_id", null: false
    t.uuid "user_id", null: false
    t.string "delivery_status", null: false
    t.jsonb "tracked_content", default: {}
    t.datetime "sent_at", precision: nil
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["campaign_id", "user_id"], name: "index_email_campaigns_deliveries_on_campaign_id_and_user_id"
    t.index ["campaign_id"], name: "index_email_campaigns_deliveries_on_campaign_id"
    t.index ["sent_at"], name: "index_email_campaigns_deliveries_on_sent_at"
    t.index ["user_id"], name: "index_email_campaigns_deliveries_on_user_id"
  end

  create_table "email_campaigns_examples", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "mail_body_html", null: false
    t.string "locale", null: false
    t.string "subject", null: false
    t.uuid "recipient_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "campaign_id"
    t.index ["campaign_id"], name: "index_email_campaigns_examples_on_campaign_id"
    t.index ["recipient_id"], name: "index_email_campaigns_examples_on_recipient_id"
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
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["email", "snippet", "locale"], name: "index_email_snippets_on_email_and_snippet_and_locale"
  end

  create_table "event_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "event_id"
    t.string "file"
    t.integer "ordering"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "name"
    t.index ["event_id"], name: "index_event_files_on_event_id"
  end

  create_table "event_images", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "event_id"
    t.string "image"
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_event_images_on_event_id"
  end

  create_table "events", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id"
    t.jsonb "title_multiloc", default: {}
    t.jsonb "description_multiloc", default: {}
    t.jsonb "location_multiloc", default: {}
    t.datetime "start_at", precision: nil
    t.datetime "end_at", precision: nil
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.geography "location_point", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.string "address_1"
    t.integer "attendees_count", default: 0, null: false
    t.jsonb "address_2_multiloc", default: {}, null: false
    t.string "using_url"
    t.jsonb "attend_button_multiloc", default: {}, null: false
    t.string "online_link"
    t.index ["location_point"], name: "index_events_on_location_point", using: :gist
    t.index ["project_id"], name: "index_events_on_project_id"
  end

  create_table "events_attendances", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "attendee_id", null: false
    t.uuid "event_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["attendee_id", "event_id"], name: "index_events_attendances_on_attendee_id_and_event_id", unique: true
    t.index ["attendee_id"], name: "index_events_attendances_on_attendee_id"
    t.index ["created_at"], name: "index_events_attendances_on_created_at"
    t.index ["event_id"], name: "index_events_attendances_on_event_id"
    t.index ["updated_at"], name: "index_events_attendances_on_updated_at"
  end

  create_table "experiments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "treatment", null: false
    t.string "action", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "flag_inappropriate_content_inappropriate_content_flags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "flaggable_id", null: false
    t.string "flaggable_type", null: false
    t.datetime "deleted_at", precision: nil
    t.string "toxicity_label"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["flaggable_id", "flaggable_type"], name: "inappropriate_content_flags_flaggable"
  end

  create_table "followers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "followable_type", null: false
    t.uuid "followable_id", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["followable_id", "followable_type", "user_id"], name: "index_followers_followable_type_id_user_id", unique: true
    t.index ["followable_type", "followable_id"], name: "index_followers_on_followable"
    t.index ["user_id"], name: "index_followers_on_user_id"
  end

  create_table "groups", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.string "slug"
    t.integer "memberships_count", default: 0, null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "membership_type"
    t.jsonb "rules", default: []
    t.index ["slug"], name: "index_groups_on_slug"
  end

  create_table "groups_permissions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "permission_id", null: false
    t.uuid "group_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["group_id"], name: "index_groups_permissions_on_group_id"
    t.index ["permission_id"], name: "index_groups_permissions_on_permission_id"
  end

  create_table "groups_projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "group_id"
    t.uuid "project_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["group_id", "project_id"], name: "index_groups_projects_on_group_id_and_project_id", unique: true
    t.index ["group_id"], name: "index_groups_projects_on_group_id"
    t.index ["project_id"], name: "index_groups_projects_on_project_id"
  end

  create_table "home_pages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "top_info_section_enabled", default: false, null: false
    t.jsonb "top_info_section_multiloc", default: {}, null: false
    t.boolean "bottom_info_section_enabled", default: false, null: false
    t.jsonb "bottom_info_section_multiloc", default: {}, null: false
    t.boolean "events_widget_enabled", default: false, null: false
    t.boolean "projects_enabled", default: true, null: false
    t.jsonb "projects_header_multiloc", default: {}, null: false
    t.boolean "banner_avatars_enabled", default: true, null: false
    t.string "banner_layout", default: "full_width_banner_layout", null: false
    t.jsonb "banner_signed_in_header_multiloc", default: {}, null: false
    t.jsonb "banner_cta_signed_in_text_multiloc", default: {}, null: false
    t.string "banner_cta_signed_in_type", default: "no_button", null: false
    t.string "banner_cta_signed_in_url"
    t.jsonb "banner_signed_out_header_multiloc", default: {}, null: false
    t.jsonb "banner_signed_out_subheader_multiloc", default: {}, null: false
    t.string "banner_signed_out_header_overlay_color"
    t.integer "banner_signed_out_header_overlay_opacity"
    t.jsonb "banner_cta_signed_out_text_multiloc", default: {}, null: false
    t.string "banner_cta_signed_out_type", default: "sign_up_button", null: false
    t.string "banner_cta_signed_out_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "header_bg"
  end

  create_table "id_id_card_lookup_id_cards", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "hashed_card_id"
    t.index ["hashed_card_id"], name: "index_id_id_card_lookup_id_cards_on_hashed_card_id"
  end

  create_table "idea_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "idea_id"
    t.string "file"
    t.integer "ordering"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "name"
    t.index ["idea_id"], name: "index_idea_files_on_idea_id"
  end

  create_table "idea_images", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "idea_id"
    t.string "image"
    t.integer "ordering"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["idea_id"], name: "index_idea_images_on_idea_id"
  end

  create_table "idea_statuses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.integer "ordering"
    t.string "code"
    t.string "color"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.jsonb "description_multiloc", default: {}
    t.integer "ideas_count", default: 0
  end

  create_table "ideas", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.jsonb "body_multiloc", default: {}
    t.string "publication_status"
    t.datetime "published_at", precision: nil
    t.uuid "project_id"
    t.uuid "author_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "likes_count", default: 0, null: false
    t.integer "dislikes_count", default: 0, null: false
    t.geography "location_point", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.string "location_description"
    t.integer "comments_count", default: 0, null: false
    t.uuid "idea_status_id"
    t.string "slug"
    t.integer "budget"
    t.integer "baskets_count", default: 0, null: false
    t.integer "official_feedbacks_count", default: 0, null: false
    t.uuid "assignee_id"
    t.datetime "assigned_at", precision: nil
    t.integer "proposed_budget"
    t.jsonb "custom_field_values", default: {}, null: false
    t.uuid "creation_phase_id"
    t.string "author_hash"
    t.boolean "anonymous", default: false, null: false
    t.integer "internal_comments_count", default: 0, null: false
    t.integer "votes_count", default: 0, null: false
    t.integer "followers_count", default: 0, null: false
    t.index "((to_tsvector('simple'::regconfig, COALESCE((title_multiloc)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((body_multiloc)::text, ''::text))))", name: "index_ideas_search", using: :gin
    t.index ["author_hash"], name: "index_ideas_on_author_hash"
    t.index ["author_id"], name: "index_ideas_on_author_id"
    t.index ["idea_status_id"], name: "index_ideas_on_idea_status_id"
    t.index ["location_point"], name: "index_ideas_on_location_point", using: :gist
    t.index ["project_id"], name: "index_ideas_on_project_id"
    t.index ["slug"], name: "index_ideas_on_slug", unique: true
  end

  create_table "ideas_phases", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "idea_id"
    t.uuid "phase_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "baskets_count", default: 0, null: false
    t.integer "votes_count", default: 0, null: false
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
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["user_id"], name: "index_identities_on_user_id"
  end

  create_table "impact_tracking_salts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "salt"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "impact_tracking_sessions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "monthly_user_hash", null: false
    t.string "highest_role"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id"
    t.index ["monthly_user_hash"], name: "index_impact_tracking_sessions_on_monthly_user_hash"
  end

  create_table "initiative_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "initiative_id"
    t.string "file"
    t.string "name"
    t.integer "ordering"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["initiative_id"], name: "index_initiative_files_on_initiative_id"
  end

  create_table "initiative_images", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "initiative_id"
    t.string "image"
    t.integer "ordering"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["initiative_id"], name: "index_initiative_images_on_initiative_id"
  end

  create_table "initiative_status_changes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id"
    t.uuid "initiative_id"
    t.uuid "initiative_status_id"
    t.uuid "official_feedback_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
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
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "initiatives", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.jsonb "body_multiloc", default: {}
    t.string "publication_status"
    t.datetime "published_at", precision: nil
    t.uuid "author_id"
    t.integer "likes_count", default: 0, null: false
    t.integer "dislikes_count", default: 0, null: false
    t.geography "location_point", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.string "location_description"
    t.string "slug"
    t.integer "comments_count", default: 0, null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "header_bg"
    t.uuid "assignee_id"
    t.integer "official_feedbacks_count", default: 0, null: false
    t.datetime "assigned_at", precision: nil
    t.string "author_hash"
    t.boolean "anonymous", default: false, null: false
    t.integer "internal_comments_count", default: 0, null: false
    t.integer "followers_count", default: 0, null: false
    t.boolean "editing_locked", default: false, null: false
    t.index "((to_tsvector('simple'::regconfig, COALESCE((title_multiloc)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((body_multiloc)::text, ''::text))))", name: "index_initiatives_search", using: :gin
    t.index ["author_id"], name: "index_initiatives_on_author_id"
    t.index ["location_point"], name: "index_initiatives_on_location_point", using: :gist
    t.index ["slug"], name: "index_initiatives_on_slug", unique: true
  end

  create_table "initiatives_topics", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "initiative_id"
    t.uuid "topic_id"
    t.index ["initiative_id", "topic_id"], name: "index_initiatives_topics_on_initiative_id_and_topic_id", unique: true
    t.index ["initiative_id"], name: "index_initiatives_topics_on_initiative_id"
    t.index ["topic_id"], name: "index_initiatives_topics_on_topic_id"
  end

  create_table "insights_categories", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.uuid "view_id", null: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "inputs_count", default: 0, null: false
    t.string "source_type"
    t.uuid "source_id"
    t.index ["source_type", "source_id"], name: "index_insights_categories_on_source"
    t.index ["source_type"], name: "index_insights_categories_on_source_type"
    t.index ["view_id", "name"], name: "index_insights_categories_on_view_id_and_name", unique: true
    t.index ["view_id"], name: "index_insights_categories_on_view_id"
  end

  create_table "insights_category_assignments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "category_id", null: false
    t.string "input_type", null: false
    t.uuid "input_id", null: false
    t.boolean "approved", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["approved"], name: "index_insights_category_assignments_on_approved"
    t.index ["category_id", "input_id", "input_type"], name: "index_single_category_assignment", unique: true
    t.index ["category_id"], name: "index_insights_category_assignments_on_category_id"
    t.index ["input_type", "input_id"], name: "index_insights_category_assignments_on_input_type_and_input_id"
  end

  create_table "insights_data_sources", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "view_id", null: false
    t.string "origin_type", null: false
    t.uuid "origin_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["origin_type", "origin_id"], name: "index_insights_data_sources_on_origin"
    t.index ["view_id", "origin_type", "origin_id"], name: "index_insights_data_sources_on_view_and_origin", unique: true
    t.index ["view_id"], name: "index_insights_data_sources_on_view_id"
  end

  create_table "insights_processed_flags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "input_type", null: false
    t.uuid "input_id", null: false
    t.uuid "view_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["input_id", "input_type", "view_id"], name: "index_single_processed_flags", unique: true
    t.index ["input_type", "input_id"], name: "index_processed_flags_on_input"
    t.index ["view_id"], name: "index_insights_processed_flags_on_view_id"
  end

  create_table "insights_text_network_analysis_tasks_views", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "task_id", null: false
    t.uuid "view_id", null: false
    t.string "language", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["task_id"], name: "index_insights_text_network_analysis_tasks_views_on_task_id"
    t.index ["view_id"], name: "index_insights_text_network_analysis_tasks_views_on_view_id"
  end

  create_table "insights_text_networks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "view_id", null: false
    t.string "language", null: false
    t.jsonb "json_network", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["language"], name: "index_insights_text_networks_on_language"
    t.index ["view_id", "language"], name: "index_insights_text_networks_on_view_id_and_language", unique: true
    t.index ["view_id"], name: "index_insights_text_networks_on_view_id"
  end

  create_table "insights_views", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_insights_views_on_name"
  end

  create_table "insights_zeroshot_classification_tasks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "task_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["task_id"], name: "index_insights_zeroshot_classification_tasks_on_task_id", unique: true
  end

  create_table "insights_zeroshot_classification_tasks_categories", id: false, force: :cascade do |t|
    t.uuid "category_id", null: false
    t.uuid "task_id", null: false
    t.index ["category_id", "task_id"], name: "index_insights_zsc_tasks_categories_on_category_id_and_task_id", unique: true
    t.index ["category_id"], name: "index_insights_zsc_tasks_categories_on_category_id"
    t.index ["task_id"], name: "index_insights_zsc_tasks_categories_on_task_id"
  end

  create_table "insights_zeroshot_classification_tasks_inputs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "task_id", null: false
    t.string "input_type", null: false
    t.uuid "input_id", null: false
    t.index ["input_id", "input_type", "task_id"], name: "index_insights_zsc_tasks_inputs_on_input_and_task_id", unique: true
    t.index ["input_type", "input_id"], name: "index_insights_zsc_tasks_inputs_on_input"
    t.index ["task_id"], name: "index_insights_zeroshot_classification_tasks_inputs_on_task_id"
  end

  create_table "internal_comments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "author_id"
    t.string "post_type"
    t.uuid "post_id"
    t.uuid "parent_id"
    t.integer "lft", null: false
    t.integer "rgt", null: false
    t.text "body", null: false
    t.string "publication_status", default: "published", null: false
    t.datetime "body_updated_at", precision: nil
    t.integer "children_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_id"], name: "index_internal_comments_on_author_id"
    t.index ["created_at"], name: "index_internal_comments_on_created_at"
    t.index ["lft"], name: "index_internal_comments_on_lft"
    t.index ["parent_id"], name: "index_internal_comments_on_parent_id"
    t.index ["post_id"], name: "index_internal_comments_on_post_id"
    t.index ["post_type", "post_id"], name: "index_internal_comments_on_post"
    t.index ["rgt"], name: "index_internal_comments_on_rgt"
  end

  create_table "invites", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "token", null: false
    t.uuid "inviter_id"
    t.uuid "invitee_id", null: false
    t.string "invite_text"
    t.datetime "accepted_at", precision: nil
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
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
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
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
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["map_config_id"], name: "index_maps_layers_on_map_config_id"
  end

  create_table "maps_legend_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "map_config_id", null: false
    t.jsonb "title_multiloc", default: {}, null: false
    t.string "color", null: false
    t.integer "ordering", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["map_config_id"], name: "index_maps_legend_items_on_map_config_id"
  end

  create_table "maps_map_configs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id", null: false
    t.geography "center", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.decimal "zoom_level", precision: 4, scale: 2
    t.string "tile_provider"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_maps_map_configs_on_project_id", unique: true
  end

  create_table "memberships", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "group_id"
    t.uuid "user_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["group_id", "user_id"], name: "index_memberships_on_group_id_and_user_id", unique: true
    t.index ["group_id"], name: "index_memberships_on_group_id"
    t.index ["user_id"], name: "index_memberships_on_user_id"
  end

  create_table "moderation_moderation_statuses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "moderatable_id"
    t.string "moderatable_type"
    t.string "status"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["moderatable_type", "moderatable_id"], name: "moderation_statuses_moderatable", unique: true
  end

  create_table "nav_bar_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "code", null: false
    t.integer "ordering"
    t.jsonb "title_multiloc"
    t.uuid "static_page_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_nav_bar_items_on_code"
    t.index ["ordering"], name: "index_nav_bar_items_on_ordering"
    t.index ["static_page_id"], name: "index_nav_bar_items_on_static_page_id"
  end

  create_table "nlp_text_network_analysis_tasks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "task_id", null: false
    t.string "handler_class", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["task_id"], name: "index_nlp_text_network_analysis_tasks_on_task_id", unique: true
  end

  create_table "notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "type"
    t.datetime "read_at", precision: nil
    t.uuid "recipient_id"
    t.uuid "post_id"
    t.uuid "comment_id"
    t.uuid "project_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
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
    t.uuid "project_folder_id"
    t.uuid "inappropriate_content_flag_id"
    t.uuid "internal_comment_id"
    t.uuid "basket_id"
    t.uuid "cosponsors_initiative_id"
    t.index ["basket_id"], name: "index_notifications_on_basket_id"
    t.index ["cosponsors_initiative_id"], name: "index_notifications_on_cosponsors_initiative_id"
    t.index ["created_at"], name: "index_notifications_on_created_at"
    t.index ["inappropriate_content_flag_id"], name: "index_notifications_on_inappropriate_content_flag_id"
    t.index ["initiating_user_id"], name: "index_notifications_on_initiating_user_id"
    t.index ["internal_comment_id"], name: "index_notifications_on_internal_comment_id"
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
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "post_type"
    t.index ["post_id", "post_type"], name: "index_official_feedbacks_on_post"
    t.index ["post_id"], name: "index_official_feedbacks_on_post_id"
    t.index ["user_id"], name: "index_official_feedbacks_on_user_id"
  end

  create_table "onboarding_campaign_dismissals", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id"
    t.string "campaign_name", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["campaign_name", "user_id"], name: "index_dismissals_on_campaign_name_and_user_id", unique: true
    t.index ["user_id"], name: "index_onboarding_campaign_dismissals_on_user_id"
  end

  create_table "permissions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "action", null: false
    t.string "permitted_by", null: false
    t.uuid "permission_scope_id"
    t.string "permission_scope_type"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "global_custom_fields", default: false, null: false
    t.index ["action"], name: "index_permissions_on_action"
    t.index ["permission_scope_id"], name: "index_permissions_on_permission_scope_id"
  end

  create_table "permissions_custom_fields", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "permission_id", null: false
    t.uuid "custom_field_id", null: false
    t.boolean "required", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["custom_field_id"], name: "index_permissions_custom_fields_on_custom_field_id"
    t.index ["permission_id", "custom_field_id"], name: "index_permission_field", unique: true
    t.index ["permission_id"], name: "index_permissions_custom_fields_on_permission_id"
  end

  create_table "phase_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "phase_id"
    t.string "file"
    t.integer "ordering"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "name"
    t.index ["phase_id"], name: "index_phase_files_on_phase_id"
  end

  create_table "phases", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id"
    t.jsonb "title_multiloc", default: {}
    t.jsonb "description_multiloc", default: {}
    t.date "start_at"
    t.date "end_at"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "participation_method", default: "ideation", null: false
    t.boolean "posting_enabled", default: true
    t.boolean "commenting_enabled", default: true
    t.boolean "reacting_enabled", default: true, null: false
    t.string "reacting_like_method", default: "unlimited", null: false
    t.integer "reacting_like_limited_max", default: 10
    t.string "survey_embed_url"
    t.string "survey_service"
    t.string "presentation_mode", default: "card"
    t.integer "voting_max_total"
    t.boolean "poll_anonymous", default: false, null: false
    t.boolean "reacting_dislike_enabled", default: true, null: false
    t.integer "ideas_count", default: 0, null: false
    t.string "ideas_order"
    t.string "input_term", default: "idea"
    t.integer "voting_min_total", default: 0
    t.string "reacting_dislike_method", default: "unlimited", null: false
    t.integer "reacting_dislike_limited_max", default: 10
    t.string "posting_method", default: "unlimited", null: false
    t.integer "posting_limited_max", default: 1
    t.string "document_annotation_embed_url"
    t.boolean "allow_anonymous_participation", default: false, null: false
    t.jsonb "campaigns_settings", default: {}
    t.string "voting_method"
    t.integer "voting_max_votes_per_idea"
    t.jsonb "voting_term_singular_multiloc", default: {}
    t.jsonb "voting_term_plural_multiloc", default: {}
    t.integer "baskets_count", default: 0, null: false
    t.integer "votes_count", default: 0, null: false
    t.index ["project_id"], name: "index_phases_on_project_id"
  end

  create_table "pins", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "admin_publication_id", null: false
    t.string "page_type", null: false
    t.uuid "page_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["admin_publication_id"], name: "index_pins_on_admin_publication_id"
    t.index ["page_id", "admin_publication_id"], name: "index_pins_on_page_id_and_admin_publication_id", unique: true
  end

  create_table "polls_options", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "question_id"
    t.jsonb "title_multiloc", default: {}, null: false
    t.integer "ordering"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["question_id"], name: "index_polls_options_on_question_id"
  end

  create_table "polls_questions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "participation_context_id", null: false
    t.string "participation_context_type", null: false
    t.jsonb "title_multiloc", default: {}, null: false
    t.integer "ordering"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "question_type", default: "single_option", null: false
    t.integer "max_options"
    t.index ["participation_context_type", "participation_context_id"], name: "index_poll_questions_on_participation_context"
  end

  create_table "polls_response_options", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "response_id"
    t.uuid "option_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["option_id"], name: "index_polls_response_options_on_option_id"
    t.index ["response_id"], name: "index_polls_response_options_on_response_id"
  end

  create_table "polls_responses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "participation_context_id", null: false
    t.string "participation_context_type", null: false
    t.uuid "user_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["participation_context_id", "participation_context_type", "user_id"], name: "index_polls_responses_on_participation_context_and_user_id", unique: true
    t.index ["participation_context_type", "participation_context_id"], name: "index_poll_responses_on_participation_context"
    t.index ["user_id"], name: "index_polls_responses_on_user_id"
  end

  create_table "project_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id"
    t.string "file"
    t.integer "ordering"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "name"
    t.index ["project_id"], name: "index_project_files_on_project_id"
  end

  create_table "project_folders_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_folder_id"
    t.string "file"
    t.string "name"
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_folder_id"], name: "index_project_folders_files_on_project_folder_id"
  end

  create_table "project_folders_folders", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc"
    t.jsonb "description_multiloc"
    t.jsonb "description_preview_multiloc"
    t.string "header_bg"
    t.string "slug"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "followers_count", default: 0, null: false
    t.index ["slug"], name: "index_project_folders_folders_on_slug"
  end

  create_table "project_folders_images", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_folder_id"
    t.string "image"
    t.integer "ordering"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_folder_id"], name: "index_project_folders_images_on_project_folder_id"
  end

  create_table "project_images", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id"
    t.string "image"
    t.integer "ordering"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["project_id"], name: "index_project_images_on_project_id"
  end

  create_table "projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.jsonb "description_multiloc", default: {}
    t.string "slug"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "header_bg"
    t.integer "ideas_count", default: 0, null: false
    t.string "visible_to", default: "public", null: false
    t.jsonb "description_preview_multiloc", default: {}
    t.string "presentation_mode", default: "card"
    t.string "participation_method", default: "ideation"
    t.boolean "posting_enabled", default: true
    t.boolean "commenting_enabled", default: true
    t.boolean "reacting_enabled", default: true, null: false
    t.string "reacting_like_method", default: "unlimited", null: false
    t.integer "reacting_like_limited_max", default: 10
    t.string "process_type", default: "timeline", null: false
    t.string "internal_role"
    t.string "survey_embed_url"
    t.string "survey_service"
    t.integer "voting_max_total"
    t.integer "comments_count", default: 0, null: false
    t.uuid "default_assignee_id"
    t.boolean "poll_anonymous", default: false, null: false
    t.boolean "reacting_dislike_enabled", default: true, null: false
    t.string "ideas_order"
    t.string "input_term", default: "idea"
    t.integer "voting_min_total", default: 0
    t.string "reacting_dislike_method", default: "unlimited", null: false
    t.integer "reacting_dislike_limited_max", default: 10
    t.boolean "include_all_areas", default: false, null: false
    t.string "posting_method", default: "unlimited", null: false
    t.integer "posting_limited_max", default: 1
    t.string "document_annotation_embed_url"
    t.boolean "allow_anonymous_participation", default: false, null: false
    t.string "voting_method"
    t.integer "voting_max_votes_per_idea"
    t.jsonb "voting_term_singular_multiloc", default: {}
    t.jsonb "voting_term_plural_multiloc", default: {}
    t.integer "baskets_count", default: 0, null: false
    t.integer "votes_count", default: 0, null: false
    t.integer "followers_count", default: 0, null: false
    t.index ["slug"], name: "index_projects_on_slug", unique: true
  end

  create_table "projects_allowed_input_topics", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.uuid "project_id"
    t.uuid "topic_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "ordering"
    t.index ["project_id"], name: "index_projects_allowed_input_topics_on_project_id"
    t.index ["topic_id", "project_id"], name: "index_projects_allowed_input_topics_on_topic_id_and_project_id", unique: true
  end

  create_table "projects_topics", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "topic_id", null: false
    t.uuid "project_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_projects_topics_on_project_id"
    t.index ["topic_id"], name: "index_projects_topics_on_topic_id"
  end

  create_table "public_api_api_clients", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.datetime "last_used_at"
    t.string "secret_digest", null: false
    t.string "secret_postfix", null: false
  end

  create_table "que_jobs", comment: "4", force: :cascade do |t|
    t.integer "priority", limit: 2, default: 100, null: false
    t.datetime "run_at", precision: nil, default: -> { "now()" }, null: false
    t.text "job_class", null: false
    t.integer "error_count", default: 0, null: false
    t.text "last_error_message"
    t.text "queue", default: "default", null: false
    t.text "last_error_backtrace"
    t.datetime "finished_at", precision: nil
    t.datetime "expired_at", precision: nil
    t.jsonb "args", default: [], null: false
    t.jsonb "data", default: {}, null: false
    t.integer "job_schema_version", default: 1
    t.index ["args"], name: "que_jobs_args_gin_idx", opclass: :jsonb_path_ops, using: :gin
    t.index ["data"], name: "que_jobs_data_gin_idx", opclass: :jsonb_path_ops, using: :gin
    t.index ["job_schema_version", "queue", "priority", "run_at", "id"], name: "que_poll_idx_with_job_schema_version", where: "((finished_at IS NULL) AND (expired_at IS NULL))"
    t.index ["queue", "priority", "run_at", "id"], name: "que_poll_idx", where: "((finished_at IS NULL) AND (expired_at IS NULL))"
  end

  create_table "que_lockers", primary_key: "pid", id: :integer, default: nil, force: :cascade do |t|
    t.integer "worker_count", null: false
    t.integer "worker_priorities", null: false, array: true
    t.integer "ruby_pid", null: false
    t.text "ruby_hostname", null: false
    t.text "queues", null: false, array: true
    t.boolean "listening", null: false
    t.integer "job_schema_version", default: 1
  end

  create_table "que_values", primary_key: "key", id: :text, force: :cascade do |t|
    t.jsonb "value", default: {}, null: false
  end

  create_table "reactions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "reactable_id"
    t.string "reactable_type"
    t.uuid "user_id"
    t.string "mode", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["reactable_type", "reactable_id", "user_id"], name: "index_reactions_on_reactable_type_and_reactable_id_and_user_id", unique: true
    t.index ["reactable_type", "reactable_id"], name: "index_reactions_on_reactable_type_and_reactable_id"
    t.index ["user_id"], name: "index_reactions_on_user_id"
  end

  create_table "report_builder_reports", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.uuid "owner_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_report_builder_reports_on_name", unique: true
    t.index ["owner_id"], name: "index_report_builder_reports_on_owner_id"
  end

  create_table "spam_reports", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "spam_reportable_id", null: false
    t.string "spam_reportable_type", null: false
    t.datetime "reported_at", precision: nil, null: false
    t.string "reason_code"
    t.string "other_reason"
    t.uuid "user_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["reported_at"], name: "index_spam_reports_on_reported_at"
    t.index ["spam_reportable_type", "spam_reportable_id"], name: "spam_reportable_index"
    t.index ["user_id"], name: "index_spam_reports_on_user_id"
  end

  create_table "static_page_files", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "static_page_id"
    t.string "file"
    t.integer "ordering"
    t.string "name"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["static_page_id"], name: "index_static_page_files_on_static_page_id"
  end

  create_table "static_pages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.string "slug"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "code", null: false
    t.jsonb "top_info_section_multiloc", default: {}, null: false
    t.boolean "banner_enabled", default: false, null: false
    t.string "banner_layout", default: "full_width_banner_layout", null: false
    t.string "banner_overlay_color"
    t.integer "banner_overlay_opacity"
    t.jsonb "banner_cta_button_multiloc", default: {}, null: false
    t.string "banner_cta_button_type", default: "no_button", null: false
    t.string "banner_cta_button_url"
    t.jsonb "banner_header_multiloc", default: {}, null: false
    t.jsonb "banner_subheader_multiloc", default: {}, null: false
    t.boolean "top_info_section_enabled", default: false, null: false
    t.boolean "files_section_enabled", default: false, null: false
    t.boolean "projects_enabled", default: false, null: false
    t.string "projects_filter_type", default: "no_filter", null: false
    t.boolean "events_widget_enabled", default: false, null: false
    t.boolean "bottom_info_section_enabled", default: false, null: false
    t.jsonb "bottom_info_section_multiloc", default: {}, null: false
    t.string "header_bg"
    t.index ["code"], name: "index_static_pages_on_code"
    t.index ["slug"], name: "index_static_pages_on_slug", unique: true
  end

  create_table "static_pages_topics", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "topic_id", null: false
    t.uuid "static_page_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["static_page_id"], name: "index_static_pages_topics_on_static_page_id"
    t.index ["topic_id"], name: "index_static_pages_topics_on_topic_id"
  end

  create_table "surveys_responses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "participation_context_id", null: false
    t.string "participation_context_type", null: false
    t.string "survey_service", null: false
    t.string "external_survey_id", null: false
    t.string "external_response_id", null: false
    t.uuid "user_id"
    t.datetime "started_at", precision: nil
    t.datetime "submitted_at", precision: nil, null: false
    t.jsonb "answers", default: {}
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["participation_context_type", "participation_context_id"], name: "index_surveys_responses_on_participation_context"
    t.index ["user_id"], name: "index_surveys_responses_on_user_id"
  end

  create_table "tenants", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.string "host"
    t.jsonb "settings", default: {}
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "logo"
    t.string "favicon"
    t.jsonb "style", default: {}
    t.datetime "deleted_at", precision: nil
    t.datetime "creation_finalized_at", precision: nil
    t.index ["creation_finalized_at"], name: "index_tenants_on_creation_finalized_at"
    t.index ["deleted_at"], name: "index_tenants_on_deleted_at"
    t.index ["host"], name: "index_tenants_on_host"
  end

  create_table "text_images", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "imageable_type", null: false
    t.uuid "imageable_id", null: false
    t.string "imageable_field"
    t.string "image"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "text_reference", null: false
  end

  create_table "texting_campaigns", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "phone_numbers", default: [], null: false, array: true
    t.text "message", null: false
    t.datetime "sent_at", precision: nil
    t.string "status", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "topics", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "title_multiloc", default: {}
    t.jsonb "description_multiloc", default: {}
    t.string "icon"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "ordering"
    t.string "code", default: "custom", null: false
    t.integer "followers_count", default: 0, null: false
    t.boolean "include_in_onboarding", default: false, null: false
    t.index ["include_in_onboarding"], name: "index_topics_on_include_in_onboarding"
  end

  create_table "user_custom_fields_representativeness_ref_distributions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "custom_field_id", null: false
    t.jsonb "distribution", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "type"
    t.index ["custom_field_id"], name: "index_ucf_representativeness_ref_distributions_on_custom_field"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.string "slug"
    t.jsonb "roles", default: []
    t.string "reset_password_token"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "avatar"
    t.string "first_name"
    t.string "last_name"
    t.string "locale"
    t.jsonb "bio_multiloc", default: {}
    t.boolean "cl1_migrated", default: false
    t.string "invite_status"
    t.jsonb "custom_field_values", default: {}
    t.datetime "registration_completed_at", precision: nil
    t.boolean "verified", default: false, null: false
    t.datetime "email_confirmed_at", precision: nil
    t.string "email_confirmation_code"
    t.integer "email_confirmation_retry_count", default: 0, null: false
    t.integer "email_confirmation_code_reset_count", default: 0, null: false
    t.datetime "email_confirmation_code_sent_at", precision: nil
    t.boolean "confirmation_required", default: true, null: false
    t.datetime "block_start_at", precision: nil
    t.string "block_reason"
    t.datetime "block_end_at", precision: nil
    t.string "new_email"
    t.integer "followings_count", default: 0, null: false
    t.jsonb "onboarding", default: {}, null: false
    t.index "lower((email)::text)", name: "users_unique_lower_email_idx", unique: true
    t.index ["email"], name: "index_users_on_email"
    t.index ["registration_completed_at"], name: "index_users_on_registration_completed_at"
    t.index ["slug"], name: "index_users_on_slug", unique: true
  end

  create_table "verification_verifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id"
    t.string "method_name", null: false
    t.string "hashed_uid", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
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
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ordering"], name: "index_volunteering_causes_on_ordering"
    t.index ["participation_context_type", "participation_context_id"], name: "index_volunteering_causes_on_participation_context"
  end

  create_table "volunteering_volunteers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "cause_id", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["cause_id", "user_id"], name: "index_volunteering_volunteers_on_cause_id_and_user_id", unique: true
    t.index ["user_id"], name: "index_volunteering_volunteers_on_user_id"
  end

  add_foreign_key "activities", "users"
  add_foreign_key "analysis_analyses", "phases"
  add_foreign_key "analysis_analyses", "projects"
  add_foreign_key "analysis_analyses_custom_fields", "analysis_analyses", column: "analysis_id"
  add_foreign_key "analysis_analyses_custom_fields", "custom_fields"
  add_foreign_key "analysis_background_tasks", "analysis_analyses", column: "analysis_id"
  add_foreign_key "analysis_insights", "analysis_analyses", column: "analysis_id"
  add_foreign_key "analysis_questions", "analysis_background_tasks", column: "background_task_id"
  add_foreign_key "analysis_summaries", "analysis_background_tasks", column: "background_task_id"
  add_foreign_key "analysis_taggings", "analysis_tags", column: "tag_id"
  add_foreign_key "analysis_taggings", "ideas", column: "input_id"
  add_foreign_key "analysis_tags", "analysis_analyses", column: "analysis_id"
  add_foreign_key "analytics_dimension_locales_fact_visits", "analytics_dimension_locales", column: "dimension_locale_id"
  add_foreign_key "analytics_dimension_locales_fact_visits", "analytics_fact_visits", column: "fact_visit_id"
  add_foreign_key "analytics_dimension_projects_fact_visits", "analytics_fact_visits", column: "fact_visit_id"
  add_foreign_key "analytics_fact_visits", "analytics_dimension_dates", column: "dimension_date_first_action_id", primary_key: "date"
  add_foreign_key "analytics_fact_visits", "analytics_dimension_dates", column: "dimension_date_last_action_id", primary_key: "date"
  add_foreign_key "analytics_fact_visits", "analytics_dimension_referrer_types", column: "dimension_referrer_type_id"
  add_foreign_key "areas", "custom_field_options"
  add_foreign_key "areas_ideas", "areas"
  add_foreign_key "areas_ideas", "ideas"
  add_foreign_key "areas_initiatives", "areas"
  add_foreign_key "areas_initiatives", "initiatives"
  add_foreign_key "areas_projects", "areas"
  add_foreign_key "areas_projects", "projects"
  add_foreign_key "areas_static_pages", "areas"
  add_foreign_key "areas_static_pages", "static_pages"
  add_foreign_key "baskets", "users"
  add_foreign_key "baskets_ideas", "baskets"
  add_foreign_key "baskets_ideas", "ideas"
  add_foreign_key "comments", "users", column: "author_id"
  add_foreign_key "cosponsors_initiatives", "initiatives"
  add_foreign_key "cosponsors_initiatives", "users"
  add_foreign_key "custom_field_options", "custom_fields"
  add_foreign_key "email_campaigns_campaign_email_commands", "users", column: "recipient_id"
  add_foreign_key "email_campaigns_campaigns", "users", column: "author_id"
  add_foreign_key "email_campaigns_campaigns_groups", "email_campaigns_campaigns", column: "campaign_id"
  add_foreign_key "email_campaigns_deliveries", "email_campaigns_campaigns", column: "campaign_id"
  add_foreign_key "email_campaigns_examples", "users", column: "recipient_id"
  add_foreign_key "event_files", "events"
  add_foreign_key "event_images", "events"
  add_foreign_key "events", "projects"
  add_foreign_key "events_attendances", "events"
  add_foreign_key "events_attendances", "users", column: "attendee_id"
  add_foreign_key "followers", "users"
  add_foreign_key "groups_permissions", "groups"
  add_foreign_key "groups_permissions", "permissions"
  add_foreign_key "groups_projects", "groups"
  add_foreign_key "groups_projects", "projects"
  add_foreign_key "idea_files", "ideas"
  add_foreign_key "idea_images", "ideas"
  add_foreign_key "ideas", "idea_statuses"
  add_foreign_key "ideas", "phases", column: "creation_phase_id"
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
  add_foreign_key "insights_categories", "insights_views", column: "view_id"
  add_foreign_key "insights_category_assignments", "insights_categories", column: "category_id"
  add_foreign_key "insights_data_sources", "insights_views", column: "view_id"
  add_foreign_key "insights_text_network_analysis_tasks_views", "insights_views", column: "view_id"
  add_foreign_key "insights_text_network_analysis_tasks_views", "nlp_text_network_analysis_tasks", column: "task_id"
  add_foreign_key "insights_text_networks", "insights_views", column: "view_id"
  add_foreign_key "insights_zeroshot_classification_tasks_categories", "insights_categories", column: "category_id"
  add_foreign_key "insights_zeroshot_classification_tasks_categories", "insights_zeroshot_classification_tasks", column: "task_id"
  add_foreign_key "insights_zeroshot_classification_tasks_inputs", "insights_zeroshot_classification_tasks", column: "task_id"
  add_foreign_key "internal_comments", "users", column: "author_id"
  add_foreign_key "invites", "users", column: "invitee_id"
  add_foreign_key "invites", "users", column: "inviter_id"
  add_foreign_key "maps_layers", "maps_map_configs", column: "map_config_id"
  add_foreign_key "maps_legend_items", "maps_map_configs", column: "map_config_id"
  add_foreign_key "memberships", "groups"
  add_foreign_key "memberships", "users"
  add_foreign_key "nav_bar_items", "static_pages"
  add_foreign_key "notifications", "baskets"
  add_foreign_key "notifications", "comments"
  add_foreign_key "notifications", "cosponsors_initiatives"
  add_foreign_key "notifications", "flag_inappropriate_content_inappropriate_content_flags", column: "inappropriate_content_flag_id"
  add_foreign_key "notifications", "internal_comments"
  add_foreign_key "notifications", "invites"
  add_foreign_key "notifications", "official_feedbacks"
  add_foreign_key "notifications", "phases"
  add_foreign_key "notifications", "projects"
  add_foreign_key "notifications", "spam_reports"
  add_foreign_key "notifications", "users", column: "initiating_user_id"
  add_foreign_key "notifications", "users", column: "recipient_id"
  add_foreign_key "official_feedbacks", "users"
  add_foreign_key "permissions_custom_fields", "custom_fields"
  add_foreign_key "permissions_custom_fields", "permissions"
  add_foreign_key "phase_files", "phases"
  add_foreign_key "phases", "projects"
  add_foreign_key "pins", "admin_publications"
  add_foreign_key "polls_options", "polls_questions", column: "question_id"
  add_foreign_key "polls_response_options", "polls_options", column: "option_id"
  add_foreign_key "polls_response_options", "polls_responses", column: "response_id"
  add_foreign_key "project_files", "projects"
  add_foreign_key "project_folders_files", "project_folders_folders", column: "project_folder_id"
  add_foreign_key "project_folders_images", "project_folders_folders", column: "project_folder_id"
  add_foreign_key "project_images", "projects"
  add_foreign_key "projects", "users", column: "default_assignee_id"
  add_foreign_key "projects_allowed_input_topics", "projects"
  add_foreign_key "projects_allowed_input_topics", "topics"
  add_foreign_key "projects_topics", "projects"
  add_foreign_key "projects_topics", "topics"
  add_foreign_key "reactions", "users"
  add_foreign_key "report_builder_reports", "users", column: "owner_id"
  add_foreign_key "spam_reports", "users"
  add_foreign_key "static_page_files", "static_pages"
  add_foreign_key "static_pages_topics", "static_pages"
  add_foreign_key "static_pages_topics", "topics"
  add_foreign_key "user_custom_fields_representativeness_ref_distributions", "custom_fields"
  add_foreign_key "volunteering_volunteers", "volunteering_causes", column: "cause_id"

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
  create_view "moderation_moderations", sql_definition: <<-SQL
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
      moderation_moderation_statuses.status AS moderation_status
     FROM ((ideas
       LEFT JOIN moderation_moderation_statuses ON ((moderation_moderation_statuses.moderatable_id = ideas.id)))
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
      moderation_moderation_statuses.status AS moderation_status
     FROM (initiatives
       LEFT JOIN moderation_moderation_statuses ON ((moderation_moderation_statuses.moderatable_id = initiatives.id)))
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
      moderation_moderation_statuses.status AS moderation_status
     FROM (((comments
       LEFT JOIN moderation_moderation_statuses ON ((moderation_moderation_statuses.moderatable_id = comments.id)))
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
      moderation_moderation_statuses.status AS moderation_status
     FROM ((comments
       LEFT JOIN moderation_moderation_statuses ON ((moderation_moderation_statuses.moderatable_id = comments.id)))
       LEFT JOIN initiatives ON ((initiatives.id = comments.post_id)))
    WHERE ((comments.post_type)::text = 'Initiative'::text);
  SQL
  create_view "analytics_dimension_projects", sql_definition: <<-SQL
      SELECT projects.id,
      projects.title_multiloc
     FROM projects;
  SQL
  create_view "analytics_build_feedbacks", sql_definition: <<-SQL
      SELECT a.post_id,
      min(a.feedback_first_date) AS feedback_first_date,
      max(a.feedback_official) AS feedback_official,
      max(a.feedback_status_change) AS feedback_status_change
     FROM ( SELECT activities.item_id AS post_id,
              min(activities.created_at) AS feedback_first_date,
              0 AS feedback_official,
              1 AS feedback_status_change
             FROM activities
            WHERE (((activities.action)::text = 'changed_status'::text) AND ((activities.item_type)::text = ANY (ARRAY[('Idea'::character varying)::text, ('Initiative'::character varying)::text])))
            GROUP BY activities.item_id
          UNION ALL
           SELECT official_feedbacks.post_id,
              min(official_feedbacks.created_at) AS feedback_first_date,
              1 AS feedback_official,
              0 AS feedback_status_change
             FROM official_feedbacks
            GROUP BY official_feedbacks.post_id) a
    GROUP BY a.post_id;
  SQL
  create_view "analytics_fact_email_deliveries", sql_definition: <<-SQL
      SELECT ecd.id,
      (ecd.sent_at)::date AS dimension_date_sent_id,
      ecd.campaign_id,
      ((ecc.type)::text <> 'EmailCampaigns::Campaigns::Manual'::text) AS automated
     FROM (email_campaigns_deliveries ecd
       JOIN email_campaigns_campaigns ecc ON ((ecc.id = ecd.campaign_id)));
  SQL
  create_view "analytics_dimension_statuses", sql_definition: <<-SQL
      SELECT idea_statuses.id,
      idea_statuses.title_multiloc,
      idea_statuses.code,
      idea_statuses.color
     FROM idea_statuses
  UNION ALL
   SELECT initiative_statuses.id,
      initiative_statuses.title_multiloc,
      initiative_statuses.code,
      initiative_statuses.color
     FROM initiative_statuses;
  SQL
  create_view "analytics_fact_registrations", sql_definition: <<-SQL
      SELECT u.id,
      u.id AS dimension_user_id,
      (u.registration_completed_at)::date AS dimension_date_registration_id,
      (i.created_at)::date AS dimension_date_invited_id,
      (i.accepted_at)::date AS dimension_date_accepted_id
     FROM (users u
       LEFT JOIN invites i ON ((i.invitee_id = u.id)));
  SQL
  create_view "analytics_dimension_users", sql_definition: <<-SQL
      SELECT users.id,
      COALESCE(((users.roles -> 0) ->> 'type'::text), 'citizen'::text) AS role,
      users.invite_status
     FROM users;
  SQL
  create_view "analytics_fact_events", sql_definition: <<-SQL
      SELECT events.id,
      events.project_id AS dimension_project_id,
      (events.created_at)::date AS dimension_date_created_id,
      (events.start_at)::date AS dimension_date_start_id,
      (events.end_at)::date AS dimension_date_end_id
     FROM events;
  SQL
  create_view "analytics_fact_project_statuses", sql_definition: <<-SQL
      WITH finished_statuses_for_timeline_projects AS (
           SELECT phases.project_id,
              ((max(phases.end_at) + 1))::timestamp without time zone AS "timestamp"
             FROM phases
            GROUP BY phases.project_id
           HAVING (max(phases.end_at) < now())
          )
   SELECT ap.publication_id AS dimension_project_id,
      ap.publication_status AS status,
      ((((p.process_type)::text = 'continuous'::text) AND ((ap.publication_status)::text = 'archived'::text)) OR ((fsftp.project_id IS NOT NULL) AND ((ap.publication_status)::text <> 'draft'::text))) AS finished,
      COALESCE(fsftp."timestamp", ap.updated_at) AS "timestamp",
      COALESCE((fsftp."timestamp")::date, (ap.updated_at)::date) AS dimension_date_id
     FROM ((admin_publications ap
       LEFT JOIN projects p ON ((ap.publication_id = p.id)))
       LEFT JOIN finished_statuses_for_timeline_projects fsftp ON ((fsftp.project_id = ap.publication_id)))
    WHERE ((ap.publication_type)::text = 'Project'::text);
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
      ideas.likes_count,
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
      initiatives.likes_count,
      initiatives.location_point,
      initiatives.location_description,
      initiatives.comments_count,
      initiatives.slug,
      initiatives.official_feedbacks_count
     FROM initiatives;
  SQL
  create_view "idea_trending_infos", sql_definition: <<-SQL
      SELECT ideas.id AS idea_id,
      GREATEST(comments_at.last_comment_at, likes_at.last_liked_at, ideas.published_at) AS last_activity_at,
      to_timestamp(round((((GREATEST(((comments_at.comments_count)::double precision * comments_at.mean_comment_at), (0)::double precision) + GREATEST(((likes_at.likes_count)::double precision * likes_at.mean_liked_at), (0)::double precision)) + date_part('epoch'::text, ideas.published_at)) / (((GREATEST((comments_at.comments_count)::numeric, 0.0) + GREATEST((likes_at.likes_count)::numeric, 0.0)) + 1.0))::double precision))) AS mean_activity_at
     FROM ((ideas
       FULL JOIN ( SELECT comments.post_id AS idea_id,
              max(comments.created_at) AS last_comment_at,
              avg(date_part('epoch'::text, comments.created_at)) AS mean_comment_at,
              count(comments.post_id) AS comments_count
             FROM comments
            GROUP BY comments.post_id) comments_at ON ((ideas.id = comments_at.idea_id)))
       FULL JOIN ( SELECT reactions.reactable_id,
              max(reactions.created_at) AS last_liked_at,
              avg(date_part('epoch'::text, reactions.created_at)) AS mean_liked_at,
              count(reactions.reactable_id) AS likes_count
             FROM reactions
            WHERE (((reactions.mode)::text = 'up'::text) AND ((reactions.reactable_type)::text = 'Idea'::text))
            GROUP BY reactions.reactable_id) likes_at ON ((ideas.id = likes_at.reactable_id)));
  SQL
  create_view "analytics_fact_participations", sql_definition: <<-SQL
      SELECT i.id,
      i.author_id AS dimension_user_id,
      i.project_id AS dimension_project_id,
          CASE
              WHEN (((pr.participation_method)::text = 'native_survey'::text) OR ((ph.participation_method)::text = 'native_survey'::text)) THEN survey.id
              ELSE idea.id
          END AS dimension_type_id,
      (i.created_at)::date AS dimension_date_created_id,
      (i.likes_count + i.dislikes_count) AS reactions_count,
      i.likes_count,
      i.dislikes_count
     FROM ((((ideas i
       LEFT JOIN projects pr ON ((pr.id = i.project_id)))
       LEFT JOIN phases ph ON ((ph.id = i.creation_phase_id)))
       JOIN analytics_dimension_types idea ON (((idea.name)::text = 'idea'::text)))
       LEFT JOIN analytics_dimension_types survey ON (((survey.name)::text = 'survey'::text)))
  UNION ALL
   SELECT i.id,
      i.author_id AS dimension_user_id,
      NULL::uuid AS dimension_project_id,
      adt.id AS dimension_type_id,
      (i.created_at)::date AS dimension_date_created_id,
      (i.likes_count + i.dislikes_count) AS reactions_count,
      i.likes_count,
      i.dislikes_count
     FROM (initiatives i
       JOIN analytics_dimension_types adt ON (((adt.name)::text = 'initiative'::text)))
  UNION ALL
   SELECT c.id,
      c.author_id AS dimension_user_id,
      i.project_id AS dimension_project_id,
      adt.id AS dimension_type_id,
      (c.created_at)::date AS dimension_date_created_id,
      (c.likes_count + c.dislikes_count) AS reactions_count,
      c.likes_count,
      c.dislikes_count
     FROM ((comments c
       JOIN analytics_dimension_types adt ON ((((adt.name)::text = 'comment'::text) AND ((adt.parent)::text = lower((c.post_type)::text)))))
       LEFT JOIN ideas i ON ((c.post_id = i.id)))
  UNION ALL
   SELECT r.id,
      r.user_id AS dimension_user_id,
      COALESCE(i.project_id, ic.project_id) AS dimension_project_id,
      adt.id AS dimension_type_id,
      (r.created_at)::date AS dimension_date_created_id,
      1 AS reactions_count,
          CASE
              WHEN ((r.mode)::text = 'up'::text) THEN 1
              ELSE 0
          END AS likes_count,
          CASE
              WHEN ((r.mode)::text = 'down'::text) THEN 1
              ELSE 0
          END AS dislikes_count
     FROM ((((reactions r
       JOIN analytics_dimension_types adt ON ((((adt.name)::text = 'reaction'::text) AND ((adt.parent)::text = lower((r.reactable_type)::text)))))
       LEFT JOIN ideas i ON ((i.id = r.reactable_id)))
       LEFT JOIN comments c ON ((c.id = r.reactable_id)))
       LEFT JOIN ideas ic ON ((ic.id = c.post_id)))
  UNION ALL
   SELECT pr.id,
      pr.user_id AS dimension_user_id,
      COALESCE(p.project_id, pr.participation_context_id) AS dimension_project_id,
      adt.id AS dimension_type_id,
      (pr.created_at)::date AS dimension_date_created_id,
      0 AS reactions_count,
      0 AS likes_count,
      0 AS dislikes_count
     FROM ((polls_responses pr
       LEFT JOIN phases p ON ((p.id = pr.participation_context_id)))
       JOIN analytics_dimension_types adt ON (((adt.name)::text = 'poll'::text)))
  UNION ALL
   SELECT vv.id,
      vv.user_id AS dimension_user_id,
      COALESCE(p.project_id, vc.participation_context_id) AS dimension_project_id,
      adt.id AS dimension_type_id,
      (vv.created_at)::date AS dimension_date_created_id,
      0 AS reactions_count,
      0 AS likes_count,
      0 AS dislikes_count
     FROM (((volunteering_volunteers vv
       LEFT JOIN volunteering_causes vc ON ((vc.id = vv.cause_id)))
       LEFT JOIN phases p ON ((p.id = vc.participation_context_id)))
       JOIN analytics_dimension_types adt ON (((adt.name)::text = 'volunteer'::text)));
  SQL
  create_view "analytics_fact_posts", sql_definition: <<-SQL
      SELECT i.id,
      i.author_id AS user_id,
      i.project_id AS dimension_project_id,
      adt.id AS dimension_type_id,
      (i.created_at)::date AS dimension_date_created_id,
      (abf.feedback_first_date)::date AS dimension_date_first_feedback_id,
      i.idea_status_id AS dimension_status_id,
      (abf.feedback_first_date - i.created_at) AS feedback_time_taken,
      COALESCE(abf.feedback_official, 0) AS feedback_official,
      COALESCE(abf.feedback_status_change, 0) AS feedback_status_change,
          CASE
              WHEN (abf.feedback_first_date IS NULL) THEN 1
              ELSE 0
          END AS feedback_none,
      (i.likes_count + i.dislikes_count) AS reactions_count,
      i.likes_count,
      i.dislikes_count,
      i.publication_status
     FROM (((((ideas i
       JOIN analytics_dimension_types adt ON (((adt.name)::text = 'idea'::text)))
       LEFT JOIN analytics_build_feedbacks abf ON ((abf.post_id = i.id)))
       LEFT JOIN ideas_phases iph ON ((iph.idea_id = i.id)))
       LEFT JOIN phases ph ON ((ph.id = iph.phase_id)))
       LEFT JOIN projects pr ON ((pr.id = i.project_id)))
    WHERE (((ph.id IS NULL) OR ((ph.participation_method)::text <> 'native_survey'::text)) AND ((pr.participation_method)::text <> 'native_survey'::text))
  UNION ALL
   SELECT i.id,
      i.author_id AS user_id,
      NULL::uuid AS dimension_project_id,
      adt.id AS dimension_type_id,
      (i.created_at)::date AS dimension_date_created_id,
      (abf.feedback_first_date)::date AS dimension_date_first_feedback_id,
      isc.initiative_status_id AS dimension_status_id,
      (abf.feedback_first_date - i.created_at) AS feedback_time_taken,
      COALESCE(abf.feedback_official, 0) AS feedback_official,
      COALESCE(abf.feedback_status_change, 0) AS feedback_status_change,
          CASE
              WHEN (abf.feedback_first_date IS NULL) THEN 1
              ELSE 0
          END AS feedback_none,
      (i.likes_count + i.dislikes_count) AS reactions_count,
      i.likes_count,
      i.dislikes_count,
      i.publication_status
     FROM (((initiatives i
       JOIN analytics_dimension_types adt ON (((adt.name)::text = 'initiative'::text)))
       LEFT JOIN analytics_build_feedbacks abf ON ((abf.post_id = i.id)))
       LEFT JOIN initiative_status_changes isc ON (((isc.initiative_id = i.id) AND (isc.updated_at = ( SELECT max(isc_.updated_at) AS max
             FROM initiative_status_changes isc_
            WHERE (isc_.initiative_id = i.id))))));
  SQL
end
