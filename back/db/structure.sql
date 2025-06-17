SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.ideas_topics DROP CONSTRAINT IF EXISTS fk_rails_ff1788eb50;
ALTER TABLE IF EXISTS ONLY public.project_reviews DROP CONSTRAINT IF EXISTS fk_rails_fdbeb12ddd;
ALTER TABLE IF EXISTS ONLY public.ideas_topics DROP CONSTRAINT IF EXISTS fk_rails_fd874ecf4b;
ALTER TABLE IF EXISTS ONLY public.events_attendances DROP CONSTRAINT IF EXISTS fk_rails_fba307ba3b;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS fk_rails_f44b1e3c8a;
ALTER TABLE IF EXISTS ONLY public.cosponsorships DROP CONSTRAINT IF EXISTS fk_rails_f32533b783;
ALTER TABLE IF EXISTS ONLY public.report_builder_published_graph_data_units DROP CONSTRAINT IF EXISTS fk_rails_f21a19c203;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_f1d8986d29;
ALTER TABLE IF EXISTS ONLY public.custom_field_bins DROP CONSTRAINT IF EXISTS fk_rails_f09b1bc4cd;
ALTER TABLE IF EXISTS ONLY public.idea_files DROP CONSTRAINT IF EXISTS fk_rails_efb12f53ad;
ALTER TABLE IF EXISTS ONLY public.static_pages_topics DROP CONSTRAINT IF EXISTS fk_rails_edc8786515;
ALTER TABLE IF EXISTS ONLY public.polls_response_options DROP CONSTRAINT IF EXISTS fk_rails_e871bf6e26;
ALTER TABLE IF EXISTS ONLY public.nav_bar_items DROP CONSTRAINT IF EXISTS fk_rails_e8076fb9f6;
ALTER TABLE IF EXISTS ONLY public.custom_field_bins DROP CONSTRAINT IF EXISTS fk_rails_e6f48b841d;
ALTER TABLE IF EXISTS ONLY public.analysis_comments_summaries DROP CONSTRAINT IF EXISTS fk_rails_e51f754cf7;
ALTER TABLE IF EXISTS ONLY public.permissions_custom_fields DROP CONSTRAINT IF EXISTS fk_rails_e211dc8f99;
ALTER TABLE IF EXISTS ONLY public.baskets_ideas DROP CONSTRAINT IF EXISTS fk_rails_dfb57cbce2;
ALTER TABLE IF EXISTS ONLY public.project_reviews DROP CONSTRAINT IF EXISTS fk_rails_de7c38cbc4;
ALTER TABLE IF EXISTS ONLY public.official_feedbacks DROP CONSTRAINT IF EXISTS fk_rails_ddd7e21dfa;
ALTER TABLE IF EXISTS ONLY public.impact_tracking_pageviews DROP CONSTRAINT IF EXISTS fk_rails_dd3b2cc184;
ALTER TABLE IF EXISTS ONLY public.project_folders_images DROP CONSTRAINT IF EXISTS fk_rails_dcbc962cfe;
ALTER TABLE IF EXISTS ONLY public.project_folders_files DROP CONSTRAINT IF EXISTS fk_rails_dc7aeb6534;
ALTER TABLE IF EXISTS ONLY public.analysis_summaries DROP CONSTRAINT IF EXISTS fk_rails_dbd13460f0;
ALTER TABLE IF EXISTS ONLY public.projects_topics DROP CONSTRAINT IF EXISTS fk_rails_db7813bfef;
ALTER TABLE IF EXISTS ONLY public.projects_allowed_input_topics DROP CONSTRAINT IF EXISTS fk_rails_db7813bfef;
ALTER TABLE IF EXISTS ONLY public.groups_projects DROP CONSTRAINT IF EXISTS fk_rails_d6353758d5;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS fk_rails_d1892257e3;
ALTER TABLE IF EXISTS ONLY public.static_page_files DROP CONSTRAINT IF EXISTS fk_rails_d0209b82ff;
ALTER TABLE IF EXISTS ONLY public.analytics_dimension_locales_fact_visits DROP CONSTRAINT IF EXISTS fk_rails_cd2a592e7b;
ALTER TABLE IF EXISTS ONLY public.analysis_taggings DROP CONSTRAINT IF EXISTS fk_rails_cc8b68bfb4;
ALTER TABLE IF EXISTS ONLY public.analysis_insights DROP CONSTRAINT IF EXISTS fk_rails_cc6c7b26fc;
ALTER TABLE IF EXISTS ONLY public.reactions DROP CONSTRAINT IF EXISTS fk_rails_c9b3bef597;
ALTER TABLE IF EXISTS ONLY public.idea_import_files DROP CONSTRAINT IF EXISTS fk_rails_c93392afae;
ALTER TABLE IF EXISTS ONLY public.email_campaigns_deliveries DROP CONSTRAINT IF EXISTS fk_rails_c87ec11171;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_c76d81b062;
ALTER TABLE IF EXISTS ONLY public.custom_field_matrix_statements DROP CONSTRAINT IF EXISTS fk_rails_c379cdcd80;
ALTER TABLE IF EXISTS ONLY public.idea_images DROP CONSTRAINT IF EXISTS fk_rails_c349bb4ac3;
ALTER TABLE IF EXISTS ONLY public.ideas DROP CONSTRAINT IF EXISTS fk_rails_c32c787647;
ALTER TABLE IF EXISTS ONLY public.project_files DROP CONSTRAINT IF EXISTS fk_rails_c26fbba4b3;
ALTER TABLE IF EXISTS ONLY public.analysis_background_tasks DROP CONSTRAINT IF EXISTS fk_rails_bde9116e72;
ALTER TABLE IF EXISTS ONLY public.ideas_phases DROP CONSTRAINT IF EXISTS fk_rails_bd36415a82;
ALTER TABLE IF EXISTS ONLY public.polls_options DROP CONSTRAINT IF EXISTS fk_rails_bb813b4549;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_b894d506a0;
ALTER TABLE IF EXISTS ONLY public.official_feedbacks DROP CONSTRAINT IF EXISTS fk_rails_b4a1624855;
ALTER TABLE IF EXISTS ONLY public.custom_field_options DROP CONSTRAINT IF EXISTS fk_rails_b48da9e6c7;
ALTER TABLE IF EXISTS ONLY public.baskets DROP CONSTRAINT IF EXISTS fk_rails_b3d04c10d5;
ALTER TABLE IF EXISTS ONLY public.phases DROP CONSTRAINT IF EXISTS fk_rails_b0efe660f5;
ALTER TABLE IF EXISTS ONLY public.analysis_tags DROP CONSTRAINT IF EXISTS fk_rails_afc2d02258;
ALTER TABLE IF EXISTS ONLY public.project_reviews DROP CONSTRAINT IF EXISTS fk_rails_ac7bc0a42f;
ALTER TABLE IF EXISTS ONLY public.maps_layers DROP CONSTRAINT IF EXISTS fk_rails_abbf8658b2;
ALTER TABLE IF EXISTS ONLY public.memberships DROP CONSTRAINT IF EXISTS fk_rails_aaf389f138;
ALTER TABLE IF EXISTS ONLY public.analytics_fact_visits DROP CONSTRAINT IF EXISTS fk_rails_a9aa810ecf;
ALTER TABLE IF EXISTS ONLY public.ideas DROP CONSTRAINT IF EXISTS fk_rails_a7a91f1df3;
ALTER TABLE IF EXISTS ONLY public.groups_permissions DROP CONSTRAINT IF EXISTS fk_rails_a5c3527604;
ALTER TABLE IF EXISTS ONLY public.event_files DROP CONSTRAINT IF EXISTS fk_rails_a590d6ddde;
ALTER TABLE IF EXISTS ONLY public.analytics_fact_visits DROP CONSTRAINT IF EXISTS fk_rails_a34b51c948;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_a2cfad997d;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_a2016447bc;
ALTER TABLE IF EXISTS ONLY public.areas_projects DROP CONSTRAINT IF EXISTS fk_rails_9ecfc9d2b9;
ALTER TABLE IF EXISTS ONLY public.event_images DROP CONSTRAINT IF EXISTS fk_rails_9dd6f2f888;
ALTER TABLE IF EXISTS ONLY public.analytics_fact_visits DROP CONSTRAINT IF EXISTS fk_rails_9b5a82cb55;
ALTER TABLE IF EXISTS ONLY public.memberships DROP CONSTRAINT IF EXISTS fk_rails_99326fb65d;
ALTER TABLE IF EXISTS ONLY public.authoring_assistance_responses DROP CONSTRAINT IF EXISTS fk_rails_98155ccbce;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_97eb4c3a35;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_9268535f02;
ALTER TABLE IF EXISTS ONLY public.areas DROP CONSTRAINT IF EXISTS fk_rails_901fc7a65b;
ALTER TABLE IF EXISTS ONLY public.areas_projects DROP CONSTRAINT IF EXISTS fk_rails_8fb43a173d;
ALTER TABLE IF EXISTS ONLY public.static_pages_topics DROP CONSTRAINT IF EXISTS fk_rails_8e3f01dacd;
ALTER TABLE IF EXISTS ONLY public.user_custom_fields_representativeness_ref_distributions DROP CONSTRAINT IF EXISTS fk_rails_8cabeff294;
ALTER TABLE IF EXISTS ONLY public.email_campaigns_campaigns DROP CONSTRAINT IF EXISTS fk_rails_87e592c9f5;
ALTER TABLE IF EXISTS ONLY public.analysis_additional_custom_fields DROP CONSTRAINT IF EXISTS fk_rails_857115261d;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_849e0c7eb7;
ALTER TABLE IF EXISTS ONLY public.ideas_phases DROP CONSTRAINT IF EXISTS fk_rails_845d7ca944;
ALTER TABLE IF EXISTS ONLY public.impact_tracking_pageviews DROP CONSTRAINT IF EXISTS fk_rails_82dc979276;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_81c11ef894;
ALTER TABLE IF EXISTS ONLY public.projects_topics DROP CONSTRAINT IF EXISTS fk_rails_812b6d9149;
ALTER TABLE IF EXISTS ONLY public.projects_allowed_input_topics DROP CONSTRAINT IF EXISTS fk_rails_812b6d9149;
ALTER TABLE IF EXISTS ONLY public.report_builder_reports DROP CONSTRAINT IF EXISTS fk_rails_81137213da;
ALTER TABLE IF EXISTS ONLY public.polls_response_options DROP CONSTRAINT IF EXISTS fk_rails_80d00e60ae;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS fk_rails_7fbb3b1416;
ALTER TABLE IF EXISTS ONLY public.email_campaigns_campaign_email_commands DROP CONSTRAINT IF EXISTS fk_rails_7f284a4f09;
ALTER TABLE IF EXISTS ONLY public.activities DROP CONSTRAINT IF EXISTS fk_rails_7e11bb717f;
ALTER TABLE IF EXISTS ONLY public.analysis_heatmap_cells DROP CONSTRAINT IF EXISTS fk_rails_7a39fbbdee;
ALTER TABLE IF EXISTS ONLY public.analysis_questions DROP CONSTRAINT IF EXISTS fk_rails_74e779db86;
ALTER TABLE IF EXISTS ONLY public.analysis_additional_custom_fields DROP CONSTRAINT IF EXISTS fk_rails_74744744a6;
ALTER TABLE IF EXISTS ONLY public.groups_projects DROP CONSTRAINT IF EXISTS fk_rails_73e1dee5fd;
ALTER TABLE IF EXISTS ONLY public.ideas DROP CONSTRAINT IF EXISTS fk_rails_730408dafc;
ALTER TABLE IF EXISTS ONLY public.email_campaigns_campaigns_groups DROP CONSTRAINT IF EXISTS fk_rails_712f4ad915;
ALTER TABLE IF EXISTS ONLY public.groups_permissions DROP CONSTRAINT IF EXISTS fk_rails_6fa6389d80;
ALTER TABLE IF EXISTS ONLY public.ideas DROP CONSTRAINT IF EXISTS fk_rails_6c9ab6d4f8;
ALTER TABLE IF EXISTS ONLY public.report_builder_reports DROP CONSTRAINT IF EXISTS fk_rails_6988c9886e;
ALTER TABLE IF EXISTS ONLY public.idea_imports DROP CONSTRAINT IF EXISTS fk_rails_67f00886f9;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_67be9591a3;
ALTER TABLE IF EXISTS ONLY public.idea_imports DROP CONSTRAINT IF EXISTS fk_rails_636c77bdd1;
ALTER TABLE IF EXISTS ONLY public.internal_comments DROP CONSTRAINT IF EXISTS fk_rails_617a7ea994;
ALTER TABLE IF EXISTS ONLY public.analysis_taggings DROP CONSTRAINT IF EXISTS fk_rails_604cfbcd8d;
ALTER TABLE IF EXISTS ONLY public.idea_imports DROP CONSTRAINT IF EXISTS fk_rails_5ea1f11fd5;
ALTER TABLE IF EXISTS ONLY public.ideas DROP CONSTRAINT IF EXISTS fk_rails_5ac7668cd3;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_575368d182;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_5471f55cd6;
ALTER TABLE IF EXISTS ONLY public.identities DROP CONSTRAINT IF EXISTS fk_rails_5373344100;
ALTER TABLE IF EXISTS ONLY public.permissions_custom_fields DROP CONSTRAINT IF EXISTS fk_rails_50335fc43f;
ALTER TABLE IF EXISTS ONLY public.analytics_dimension_projects_fact_visits DROP CONSTRAINT IF EXISTS fk_rails_4ecebb6e8a;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_4aea6afa11;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_47abdd0847;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_rails_46dd2ccfd1;
ALTER TABLE IF EXISTS ONLY public.email_campaigns_examples DROP CONSTRAINT IF EXISTS fk_rails_465d6356b2;
ALTER TABLE IF EXISTS ONLY public.followers DROP CONSTRAINT IF EXISTS fk_rails_3d258d3942;
ALTER TABLE IF EXISTS ONLY public.analysis_analyses DROP CONSTRAINT IF EXISTS fk_rails_3c57357702;
ALTER TABLE IF EXISTS ONLY public.baskets_ideas DROP CONSTRAINT IF EXISTS fk_rails_39a1b51358;
ALTER TABLE IF EXISTS ONLY public.custom_field_option_images DROP CONSTRAINT IF EXISTS fk_rails_3814d72daa;
ALTER TABLE IF EXISTS ONLY public.analysis_comments_summaries DROP CONSTRAINT IF EXISTS fk_rails_37becdebb0;
ALTER TABLE IF EXISTS ONLY public.nav_bar_items DROP CONSTRAINT IF EXISTS fk_rails_34143a680f;
ALTER TABLE IF EXISTS ONLY public.volunteering_volunteers DROP CONSTRAINT IF EXISTS fk_rails_33a154a9ba;
ALTER TABLE IF EXISTS ONLY public.phase_files DROP CONSTRAINT IF EXISTS fk_rails_33852a9a71;
ALTER TABLE IF EXISTS ONLY public.cosponsorships DROP CONSTRAINT IF EXISTS fk_rails_2d026b99a2;
ALTER TABLE IF EXISTS ONLY public.phases DROP CONSTRAINT IF EXISTS fk_rails_2c74f68dd3;
ALTER TABLE IF EXISTS ONLY public.analysis_analyses DROP CONSTRAINT IF EXISTS fk_rails_2a92a64a56;
ALTER TABLE IF EXISTS ONLY public.events_attendances DROP CONSTRAINT IF EXISTS fk_rails_29ccdf5b04;
ALTER TABLE IF EXISTS ONLY public.areas_static_pages DROP CONSTRAINT IF EXISTS fk_rails_231f268568;
ALTER TABLE IF EXISTS ONLY public.idea_import_files DROP CONSTRAINT IF EXISTS fk_rails_229b6de93f;
ALTER TABLE IF EXISTS ONLY public.project_images DROP CONSTRAINT IF EXISTS fk_rails_2119c24213;
ALTER TABLE IF EXISTS ONLY public.areas_static_pages DROP CONSTRAINT IF EXISTS fk_rails_1fc601f42c;
ALTER TABLE IF EXISTS ONLY public.analysis_analyses DROP CONSTRAINT IF EXISTS fk_rails_16b3d1e637;
ALTER TABLE IF EXISTS ONLY public.spam_reports DROP CONSTRAINT IF EXISTS fk_rails_121f3a2011;
ALTER TABLE IF EXISTS ONLY public.ideas DROP CONSTRAINT IF EXISTS fk_rails_0e5b472696;
ALTER TABLE IF EXISTS ONLY public.invites DROP CONSTRAINT IF EXISTS fk_rails_0b6ac3e1da;
ALTER TABLE IF EXISTS ONLY public.invites DROP CONSTRAINT IF EXISTS fk_rails_06b2d7a3a8;
ALTER TABLE IF EXISTS ONLY public.internal_comments DROP CONSTRAINT IF EXISTS fk_rails_04be8cf6ba;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS fk_rails_0434b48643;
ALTER TABLE IF EXISTS ONLY public.analytics_dimension_locales_fact_visits DROP CONSTRAINT IF EXISTS fk_rails_00698f2e02;
DROP TRIGGER IF EXISTS que_state_notify ON public.que_jobs;
DROP TRIGGER IF EXISTS que_job_notify ON public.que_jobs;
DROP INDEX IF EXISTS public.users_unique_lower_email_idx;
DROP INDEX IF EXISTS public.spam_reportable_index;
DROP INDEX IF EXISTS public.report_builder_published_data_units_report_id_idx;
DROP INDEX IF EXISTS public.que_poll_idx;
DROP INDEX IF EXISTS public.que_jobs_kwargs_gin_idx;
DROP INDEX IF EXISTS public.que_jobs_data_gin_idx;
DROP INDEX IF EXISTS public.que_jobs_args_gin_idx;
DROP INDEX IF EXISTS public.moderation_statuses_moderatable;
DROP INDEX IF EXISTS public.machine_translations_translatable;
DROP INDEX IF EXISTS public.machine_translations_lookup;
DROP INDEX IF EXISTS public.index_volunteering_volunteers_on_user_id;
DROP INDEX IF EXISTS public.index_volunteering_volunteers_on_cause_id_and_user_id;
DROP INDEX IF EXISTS public.index_volunteering_causes_on_phase_id;
DROP INDEX IF EXISTS public.index_volunteering_causes_on_ordering;
DROP INDEX IF EXISTS public.index_verification_verifications_on_user_id;
DROP INDEX IF EXISTS public.index_verification_verifications_on_hashed_uid;
DROP INDEX IF EXISTS public.index_users_on_unique_code;
DROP INDEX IF EXISTS public.index_users_on_slug;
DROP INDEX IF EXISTS public.index_users_on_registration_completed_at;
DROP INDEX IF EXISTS public.index_users_on_email;
DROP INDEX IF EXISTS public.index_ucf_representativeness_ref_distributions_on_custom_field;
DROP INDEX IF EXISTS public.index_topics_on_include_in_onboarding;
DROP INDEX IF EXISTS public.index_tenants_on_host;
DROP INDEX IF EXISTS public.index_tenants_on_deleted_at;
DROP INDEX IF EXISTS public.index_tenants_on_creation_finalized_at;
DROP INDEX IF EXISTS public.index_surveys_responses_on_user_id;
DROP INDEX IF EXISTS public.index_surveys_responses_on_phase_id;
DROP INDEX IF EXISTS public.index_static_pages_topics_on_topic_id;
DROP INDEX IF EXISTS public.index_static_pages_topics_on_static_page_id;
DROP INDEX IF EXISTS public.index_static_pages_on_slug;
DROP INDEX IF EXISTS public.index_static_pages_on_code;
DROP INDEX IF EXISTS public.index_static_page_files_on_static_page_id;
DROP INDEX IF EXISTS public.index_spam_reports_on_user_id;
DROP INDEX IF EXISTS public.index_spam_reports_on_reported_at;
DROP INDEX IF EXISTS public.index_report_builder_reports_on_phase_id;
DROP INDEX IF EXISTS public.index_report_builder_reports_on_owner_id;
DROP INDEX IF EXISTS public.index_report_builder_reports_on_name_tsvector;
DROP INDEX IF EXISTS public.index_report_builder_reports_on_name;
DROP INDEX IF EXISTS public.index_reactions_on_user_id;
DROP INDEX IF EXISTS public.index_reactions_on_reactable_type_and_reactable_id_and_user_id;
DROP INDEX IF EXISTS public.index_reactions_on_reactable_type_and_reactable_id;
DROP INDEX IF EXISTS public.index_projects_topics_on_topic_id;
DROP INDEX IF EXISTS public.index_projects_topics_on_project_id;
DROP INDEX IF EXISTS public.index_projects_on_slug;
DROP INDEX IF EXISTS public.index_projects_allowed_input_topics_on_topic_id_and_project_id;
DROP INDEX IF EXISTS public.index_projects_allowed_input_topics_on_project_id;
DROP INDEX IF EXISTS public.index_project_reviews_on_reviewer_id;
DROP INDEX IF EXISTS public.index_project_reviews_on_requester_id;
DROP INDEX IF EXISTS public.index_project_reviews_on_project_id;
DROP INDEX IF EXISTS public.index_project_images_on_project_id;
DROP INDEX IF EXISTS public.index_project_folders_images_on_project_folder_id;
DROP INDEX IF EXISTS public.index_project_folders_folders_on_slug;
DROP INDEX IF EXISTS public.index_project_folders_files_on_project_folder_id;
DROP INDEX IF EXISTS public.index_project_files_on_project_id;
DROP INDEX IF EXISTS public.index_polls_responses_on_user_id;
DROP INDEX IF EXISTS public.index_polls_responses_on_phase_id;
DROP INDEX IF EXISTS public.index_polls_response_options_on_response_id;
DROP INDEX IF EXISTS public.index_polls_response_options_on_option_id;
DROP INDEX IF EXISTS public.index_polls_questions_on_phase_id;
DROP INDEX IF EXISTS public.index_polls_options_on_question_id;
DROP INDEX IF EXISTS public.index_phases_on_start_at_and_end_at;
DROP INDEX IF EXISTS public.index_phases_on_project_id;
DROP INDEX IF EXISTS public.index_phases_on_manual_voters_last_updated_by_id;
DROP INDEX IF EXISTS public.index_phase_files_on_phase_id;
DROP INDEX IF EXISTS public.index_permissions_on_permission_scope_id;
DROP INDEX IF EXISTS public.index_permissions_on_action;
DROP INDEX IF EXISTS public.index_permissions_custom_fields_on_permission_id;
DROP INDEX IF EXISTS public.index_permissions_custom_fields_on_custom_field_id;
DROP INDEX IF EXISTS public.index_permission_field;
DROP INDEX IF EXISTS public.index_onboarding_campaign_dismissals_on_user_id;
DROP INDEX IF EXISTS public.index_official_feedbacks_on_user_id;
DROP INDEX IF EXISTS public.index_official_feedbacks_on_idea_id;
DROP INDEX IF EXISTS public.index_notifications_on_spam_report_id;
DROP INDEX IF EXISTS public.index_notifications_on_recipient_id_and_read_at;
DROP INDEX IF EXISTS public.index_notifications_on_recipient_id;
DROP INDEX IF EXISTS public.index_notifications_on_project_review_id;
DROP INDEX IF EXISTS public.index_notifications_on_phase_id;
DROP INDEX IF EXISTS public.index_notifications_on_official_feedback_id;
DROP INDEX IF EXISTS public.index_notifications_on_invite_id;
DROP INDEX IF EXISTS public.index_notifications_on_internal_comment_id;
DROP INDEX IF EXISTS public.index_notifications_on_initiating_user_id;
DROP INDEX IF EXISTS public.index_notifications_on_inappropriate_content_flag_id;
DROP INDEX IF EXISTS public.index_notifications_on_idea_status_id;
DROP INDEX IF EXISTS public.index_notifications_on_created_at;
DROP INDEX IF EXISTS public.index_notifications_on_cosponsorship_id;
DROP INDEX IF EXISTS public.index_notifications_on_basket_id;
DROP INDEX IF EXISTS public.index_nav_bar_items_on_static_page_id;
DROP INDEX IF EXISTS public.index_nav_bar_items_on_project_id;
DROP INDEX IF EXISTS public.index_nav_bar_items_on_ordering;
DROP INDEX IF EXISTS public.index_nav_bar_items_on_code;
DROP INDEX IF EXISTS public.index_memberships_on_user_id;
DROP INDEX IF EXISTS public.index_memberships_on_group_id_and_user_id;
DROP INDEX IF EXISTS public.index_memberships_on_group_id;
DROP INDEX IF EXISTS public.index_maps_map_configs_on_mappable_id;
DROP INDEX IF EXISTS public.index_maps_map_configs_on_mappable;
DROP INDEX IF EXISTS public.index_maps_layers_on_map_config_id;
DROP INDEX IF EXISTS public.index_invites_on_token;
DROP INDEX IF EXISTS public.index_invites_on_inviter_id;
DROP INDEX IF EXISTS public.index_invites_on_invitee_id;
DROP INDEX IF EXISTS public.index_internal_comments_on_rgt;
DROP INDEX IF EXISTS public.index_internal_comments_on_parent_id;
DROP INDEX IF EXISTS public.index_internal_comments_on_lft;
DROP INDEX IF EXISTS public.index_internal_comments_on_idea_id;
DROP INDEX IF EXISTS public.index_internal_comments_on_created_at;
DROP INDEX IF EXISTS public.index_internal_comments_on_author_id;
DROP INDEX IF EXISTS public.index_impact_tracking_sessions_on_monthly_user_hash;
DROP INDEX IF EXISTS public.index_identities_on_user_id;
DROP INDEX IF EXISTS public.index_ideas_topics_on_topic_id;
DROP INDEX IF EXISTS public.index_ideas_topics_on_idea_id_and_topic_id;
DROP INDEX IF EXISTS public.index_ideas_topics_on_idea_id;
DROP INDEX IF EXISTS public.index_ideas_search;
DROP INDEX IF EXISTS public.index_ideas_phases_on_phase_id;
DROP INDEX IF EXISTS public.index_ideas_phases_on_idea_id_and_phase_id;
DROP INDEX IF EXISTS public.index_ideas_phases_on_idea_id;
DROP INDEX IF EXISTS public.index_ideas_on_title_multiloc;
DROP INDEX IF EXISTS public.index_ideas_on_slug;
DROP INDEX IF EXISTS public.index_ideas_on_project_id;
DROP INDEX IF EXISTS public.index_ideas_on_manual_votes_last_updated_by_id;
DROP INDEX IF EXISTS public.index_ideas_on_location_point;
DROP INDEX IF EXISTS public.index_ideas_on_idea_status_id;
DROP INDEX IF EXISTS public.index_ideas_on_body_multiloc;
DROP INDEX IF EXISTS public.index_ideas_on_author_id;
DROP INDEX IF EXISTS public.index_ideas_on_author_hash;
DROP INDEX IF EXISTS public.index_idea_imports_on_import_user_id;
DROP INDEX IF EXISTS public.index_idea_imports_on_idea_id;
DROP INDEX IF EXISTS public.index_idea_imports_on_file_id;
DROP INDEX IF EXISTS public.index_idea_import_files_on_project_id;
DROP INDEX IF EXISTS public.index_idea_import_files_on_parent_id;
DROP INDEX IF EXISTS public.index_idea_images_on_idea_id;
DROP INDEX IF EXISTS public.index_idea_files_on_idea_id;
DROP INDEX IF EXISTS public.index_id_id_card_lookup_id_cards_on_hashed_card_id;
DROP INDEX IF EXISTS public.index_groups_projects_on_project_id;
DROP INDEX IF EXISTS public.index_groups_projects_on_group_id_and_project_id;
DROP INDEX IF EXISTS public.index_groups_projects_on_group_id;
DROP INDEX IF EXISTS public.index_groups_permissions_on_permission_id;
DROP INDEX IF EXISTS public.index_groups_permissions_on_group_id;
DROP INDEX IF EXISTS public.index_groups_on_slug;
DROP INDEX IF EXISTS public.index_followers_on_user_id;
DROP INDEX IF EXISTS public.index_followers_on_followable_id_and_followable_type;
DROP INDEX IF EXISTS public.index_followers_on_followable;
DROP INDEX IF EXISTS public.index_followers_followable_type_id_user_id;
DROP INDEX IF EXISTS public.index_events_on_project_id;
DROP INDEX IF EXISTS public.index_events_on_location_point;
DROP INDEX IF EXISTS public.index_events_attendances_on_updated_at;
DROP INDEX IF EXISTS public.index_events_attendances_on_event_id;
DROP INDEX IF EXISTS public.index_events_attendances_on_created_at;
DROP INDEX IF EXISTS public.index_events_attendances_on_attendee_id_and_event_id;
DROP INDEX IF EXISTS public.index_events_attendances_on_attendee_id;
DROP INDEX IF EXISTS public.index_event_images_on_event_id;
DROP INDEX IF EXISTS public.index_event_files_on_event_id;
DROP INDEX IF EXISTS public.index_embeddings_similarities_on_embedding;
DROP INDEX IF EXISTS public.index_embeddings_similarities_on_embedded_attributes;
DROP INDEX IF EXISTS public.index_embeddings_similarities_on_embeddable;
DROP INDEX IF EXISTS public.index_email_snippets_on_email_and_snippet_and_locale;
DROP INDEX IF EXISTS public.index_email_campaigns_unsubscription_tokens_on_user_id;
DROP INDEX IF EXISTS public.index_email_campaigns_unsubscription_tokens_on_token;
DROP INDEX IF EXISTS public.index_email_campaigns_examples_on_recipient_id;
DROP INDEX IF EXISTS public.index_email_campaigns_examples_on_campaign_id;
DROP INDEX IF EXISTS public.index_email_campaigns_deliveries_on_user_id;
DROP INDEX IF EXISTS public.index_email_campaigns_deliveries_on_sent_at;
DROP INDEX IF EXISTS public.index_email_campaigns_deliveries_on_campaign_id_and_user_id;
DROP INDEX IF EXISTS public.index_email_campaigns_deliveries_on_campaign_id;
DROP INDEX IF EXISTS public.index_email_campaigns_consents_on_user_id;
DROP INDEX IF EXISTS public.index_email_campaigns_consents_on_campaign_type_and_user_id;
DROP INDEX IF EXISTS public.index_email_campaigns_campaigns_on_type;
DROP INDEX IF EXISTS public.index_email_campaigns_campaigns_on_context_id;
DROP INDEX IF EXISTS public.index_email_campaigns_campaigns_on_author_id;
DROP INDEX IF EXISTS public.index_email_campaigns_campaigns_groups_on_group_id;
DROP INDEX IF EXISTS public.index_email_campaigns_campaigns_groups_on_campaign_id;
DROP INDEX IF EXISTS public.index_email_campaigns_campaign_email_commands_on_recipient_id;
DROP INDEX IF EXISTS public.index_dismissals_on_campaign_name_and_user_id;
DROP INDEX IF EXISTS public.index_custom_forms_on_participation_context;
DROP INDEX IF EXISTS public.index_custom_fields_on_resource_type_and_resource_id;
DROP INDEX IF EXISTS public.index_custom_field_options_on_custom_field_id_and_key;
DROP INDEX IF EXISTS public.index_custom_field_options_on_custom_field_id;
DROP INDEX IF EXISTS public.index_custom_field_option_images_on_custom_field_option_id;
DROP INDEX IF EXISTS public.index_custom_field_matrix_statements_on_key;
DROP INDEX IF EXISTS public.index_custom_field_matrix_statements_on_custom_field_id;
DROP INDEX IF EXISTS public.index_custom_field_bins_on_custom_field_option_id;
DROP INDEX IF EXISTS public.index_custom_field_bins_on_custom_field_id;
DROP INDEX IF EXISTS public.index_cosponsorships_on_user_id;
DROP INDEX IF EXISTS public.index_cosponsorships_on_idea_id;
DROP INDEX IF EXISTS public.index_content_builder_layouts_content_buidable_type_id_code;
DROP INDEX IF EXISTS public.index_common_passwords_on_password;
DROP INDEX IF EXISTS public.index_comments_on_rgt;
DROP INDEX IF EXISTS public.index_comments_on_parent_id;
DROP INDEX IF EXISTS public.index_comments_on_lft;
DROP INDEX IF EXISTS public.index_comments_on_idea_id;
DROP INDEX IF EXISTS public.index_comments_on_created_at;
DROP INDEX IF EXISTS public.index_comments_on_author_id;
DROP INDEX IF EXISTS public.index_campaigns_groups;
DROP INDEX IF EXISTS public.index_baskets_on_user_id;
DROP INDEX IF EXISTS public.index_baskets_on_submitted_at;
DROP INDEX IF EXISTS public.index_baskets_on_phase_id;
DROP INDEX IF EXISTS public.index_baskets_ideas_on_idea_id;
DROP INDEX IF EXISTS public.index_baskets_ideas_on_basket_id_and_idea_id;
DROP INDEX IF EXISTS public.index_authoring_assistance_responses_on_idea_id;
DROP INDEX IF EXISTS public.index_areas_static_pages_on_static_page_id;
DROP INDEX IF EXISTS public.index_areas_static_pages_on_area_id;
DROP INDEX IF EXISTS public.index_areas_projects_on_project_id_and_area_id;
DROP INDEX IF EXISTS public.index_areas_projects_on_project_id;
DROP INDEX IF EXISTS public.index_areas_projects_on_area_id;
DROP INDEX IF EXISTS public.index_areas_on_include_in_onboarding;
DROP INDEX IF EXISTS public.index_areas_on_custom_field_option_id;
DROP INDEX IF EXISTS public.index_analytics_dimension_types_on_name_and_parent;
DROP INDEX IF EXISTS public.index_analytics_dimension_locales_on_name;
DROP INDEX IF EXISTS public.index_analysis_tags_on_analysis_id_and_name;
DROP INDEX IF EXISTS public.index_analysis_tags_on_analysis_id;
DROP INDEX IF EXISTS public.index_analysis_taggings_on_tag_id_and_input_id;
DROP INDEX IF EXISTS public.index_analysis_taggings_on_tag_id;
DROP INDEX IF EXISTS public.index_analysis_taggings_on_input_id;
DROP INDEX IF EXISTS public.index_analysis_summaries_on_background_task_id;
DROP INDEX IF EXISTS public.index_analysis_questions_on_background_task_id;
DROP INDEX IF EXISTS public.index_analysis_insights_on_insightable;
DROP INDEX IF EXISTS public.index_analysis_insights_on_analysis_id;
DROP INDEX IF EXISTS public.index_analysis_heatmap_cells_uniqueness;
DROP INDEX IF EXISTS public.index_analysis_heatmap_cells_on_row;
DROP INDEX IF EXISTS public.index_analysis_heatmap_cells_on_column;
DROP INDEX IF EXISTS public.index_analysis_heatmap_cells_on_analysis_id;
DROP INDEX IF EXISTS public.index_analysis_comments_summaries_on_idea_id;
DROP INDEX IF EXISTS public.index_analysis_comments_summaries_on_background_task_id;
DROP INDEX IF EXISTS public.index_analysis_background_tasks_on_analysis_id;
DROP INDEX IF EXISTS public.index_analysis_analyses_on_project_id;
DROP INDEX IF EXISTS public.index_analysis_analyses_on_phase_id;
DROP INDEX IF EXISTS public.index_analysis_analyses_on_main_custom_field_id;
DROP INDEX IF EXISTS public.index_analysis_analyses_custom_fields;
DROP INDEX IF EXISTS public.index_analysis_additional_custom_fields_on_custom_field_id;
DROP INDEX IF EXISTS public.index_analysis_additional_custom_fields_on_analysis_id;
DROP INDEX IF EXISTS public.index_admin_publications_on_rgt;
DROP INDEX IF EXISTS public.index_admin_publications_on_publication_type_and_publication_id;
DROP INDEX IF EXISTS public.index_admin_publications_on_publication_status;
DROP INDEX IF EXISTS public.index_admin_publications_on_parent_id;
DROP INDEX IF EXISTS public.index_admin_publications_on_ordering;
DROP INDEX IF EXISTS public.index_admin_publications_on_lft;
DROP INDEX IF EXISTS public.index_admin_publications_on_depth;
DROP INDEX IF EXISTS public.index_activities_on_user_id;
DROP INDEX IF EXISTS public.index_activities_on_project_id;
DROP INDEX IF EXISTS public.index_activities_on_item_type_and_item_id;
DROP INDEX IF EXISTS public.index_activities_on_action;
DROP INDEX IF EXISTS public.index_activities_on_acted_at;
DROP INDEX IF EXISTS public.inappropriate_content_flags_flaggable;
DROP INDEX IF EXISTS public.i_v_user;
DROP INDEX IF EXISTS public.i_v_timestamp;
DROP INDEX IF EXISTS public.i_v_referrer_type;
DROP INDEX IF EXISTS public.i_v_matomo_visit;
DROP INDEX IF EXISTS public.i_v_last_action;
DROP INDEX IF EXISTS public.i_v_first_action;
DROP INDEX IF EXISTS public.i_p_v_visit;
DROP INDEX IF EXISTS public.i_p_v_project;
DROP INDEX IF EXISTS public.i_l_v_visit;
DROP INDEX IF EXISTS public.i_l_v_locale;
DROP INDEX IF EXISTS public.i_d_referrer_key;
DROP INDEX IF EXISTS public.i_analytics_dim_projects_fact_visits_on_project_and_visit_ids;
DROP INDEX IF EXISTS public.i_analytics_dim_locales_fact_visits_on_locale_and_visit_ids;
ALTER TABLE IF EXISTS ONLY public.reactions DROP CONSTRAINT IF EXISTS votes_pkey;
ALTER TABLE IF EXISTS ONLY public.volunteering_volunteers DROP CONSTRAINT IF EXISTS volunteering_volunteers_pkey;
ALTER TABLE IF EXISTS ONLY public.volunteering_causes DROP CONSTRAINT IF EXISTS volunteering_causes_pkey;
ALTER TABLE IF EXISTS ONLY public.verification_verifications DROP CONSTRAINT IF EXISTS verification_verifications_pkey;
ALTER TABLE IF EXISTS ONLY public.id_id_card_lookup_id_cards DROP CONSTRAINT IF EXISTS verification_id_cards_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_custom_fields_representativeness_ref_distributions DROP CONSTRAINT IF EXISTS user_custom_fields_representativeness_ref_distributions_pkey;
ALTER TABLE IF EXISTS ONLY public.topics DROP CONSTRAINT IF EXISTS topics_pkey;
ALTER TABLE IF EXISTS ONLY public.text_images DROP CONSTRAINT IF EXISTS text_images_pkey;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY public.surveys_responses DROP CONSTRAINT IF EXISTS surveys_responses_pkey;
ALTER TABLE IF EXISTS ONLY public.static_pages_topics DROP CONSTRAINT IF EXISTS static_pages_topics_pkey;
ALTER TABLE IF EXISTS ONLY public.spam_reports DROP CONSTRAINT IF EXISTS spam_reports_pkey;
ALTER TABLE IF EXISTS ONLY public.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.report_builder_reports DROP CONSTRAINT IF EXISTS report_builder_reports_pkey;
ALTER TABLE IF EXISTS ONLY public.report_builder_published_graph_data_units DROP CONSTRAINT IF EXISTS report_builder_published_graph_data_units_pkey;
ALTER TABLE IF EXISTS ONLY public.que_values DROP CONSTRAINT IF EXISTS que_values_pkey;
ALTER TABLE IF EXISTS ONLY public.que_lockers DROP CONSTRAINT IF EXISTS que_lockers_pkey;
ALTER TABLE IF EXISTS ONLY public.que_jobs DROP CONSTRAINT IF EXISTS que_jobs_pkey;
ALTER TABLE IF EXISTS ONLY public.public_api_api_clients DROP CONSTRAINT IF EXISTS public_api_api_clients_pkey;
ALTER TABLE IF EXISTS ONLY public.projects_topics DROP CONSTRAINT IF EXISTS projects_topics_pkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_pkey;
ALTER TABLE IF EXISTS ONLY public.projects_allowed_input_topics DROP CONSTRAINT IF EXISTS projects_allowed_input_topics_pkey;
ALTER TABLE IF EXISTS ONLY public.project_reviews DROP CONSTRAINT IF EXISTS project_reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.project_images DROP CONSTRAINT IF EXISTS project_images_pkey;
ALTER TABLE IF EXISTS ONLY public.project_folders_folders DROP CONSTRAINT IF EXISTS project_folders_pkey;
ALTER TABLE IF EXISTS ONLY public.project_folders_images DROP CONSTRAINT IF EXISTS project_folder_images_pkey;
ALTER TABLE IF EXISTS ONLY public.project_folders_files DROP CONSTRAINT IF EXISTS project_folder_files_pkey;
ALTER TABLE IF EXISTS ONLY public.project_files DROP CONSTRAINT IF EXISTS project_files_pkey;
ALTER TABLE IF EXISTS ONLY public.polls_responses DROP CONSTRAINT IF EXISTS polls_responses_pkey;
ALTER TABLE IF EXISTS ONLY public.polls_response_options DROP CONSTRAINT IF EXISTS polls_response_options_pkey;
ALTER TABLE IF EXISTS ONLY public.polls_questions DROP CONSTRAINT IF EXISTS polls_questions_pkey;
ALTER TABLE IF EXISTS ONLY public.polls_options DROP CONSTRAINT IF EXISTS polls_options_pkey;
ALTER TABLE IF EXISTS public.phases DROP CONSTRAINT IF EXISTS phases_start_before_end;
ALTER TABLE IF EXISTS ONLY public.phases DROP CONSTRAINT IF EXISTS phases_pkey;
ALTER TABLE IF EXISTS ONLY public.phase_files DROP CONSTRAINT IF EXISTS phase_files_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions_custom_fields DROP CONSTRAINT IF EXISTS permissions_custom_fields_pkey;
ALTER TABLE IF EXISTS ONLY public.static_pages DROP CONSTRAINT IF EXISTS pages_pkey;
ALTER TABLE IF EXISTS ONLY public.static_page_files DROP CONSTRAINT IF EXISTS page_files_pkey;
ALTER TABLE IF EXISTS ONLY public.onboarding_campaign_dismissals DROP CONSTRAINT IF EXISTS onboarding_campaign_dismissals_pkey;
ALTER TABLE IF EXISTS ONLY public.official_feedbacks DROP CONSTRAINT IF EXISTS official_feedbacks_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.nav_bar_items DROP CONSTRAINT IF EXISTS nav_bar_items_pkey;
ALTER TABLE IF EXISTS ONLY public.moderation_moderation_statuses DROP CONSTRAINT IF EXISTS moderation_statuses_pkey;
ALTER TABLE IF EXISTS ONLY public.memberships DROP CONSTRAINT IF EXISTS memberships_pkey;
ALTER TABLE IF EXISTS ONLY public.maps_map_configs DROP CONSTRAINT IF EXISTS maps_map_configs_pkey;
ALTER TABLE IF EXISTS ONLY public.maps_layers DROP CONSTRAINT IF EXISTS maps_layers_pkey;
ALTER TABLE IF EXISTS ONLY public.machine_translations_machine_translations DROP CONSTRAINT IF EXISTS machine_translations_machine_translations_pkey;
ALTER TABLE IF EXISTS ONLY public.invites DROP CONSTRAINT IF EXISTS invites_pkey;
ALTER TABLE IF EXISTS ONLY public.internal_comments DROP CONSTRAINT IF EXISTS internal_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.impact_tracking_sessions DROP CONSTRAINT IF EXISTS impact_tracking_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.impact_tracking_salts DROP CONSTRAINT IF EXISTS impact_tracking_salts_pkey;
ALTER TABLE IF EXISTS ONLY public.impact_tracking_pageviews DROP CONSTRAINT IF EXISTS impact_tracking_pageviews_pkey;
ALTER TABLE IF EXISTS ONLY public.identities DROP CONSTRAINT IF EXISTS identities_pkey;
ALTER TABLE IF EXISTS ONLY public.ideas_topics DROP CONSTRAINT IF EXISTS ideas_topics_pkey;
ALTER TABLE IF EXISTS ONLY public.ideas DROP CONSTRAINT IF EXISTS ideas_pkey;
ALTER TABLE IF EXISTS ONLY public.ideas_phases DROP CONSTRAINT IF EXISTS ideas_phases_pkey;
ALTER TABLE IF EXISTS ONLY public.idea_statuses DROP CONSTRAINT IF EXISTS idea_statuses_pkey;
ALTER TABLE IF EXISTS ONLY public.idea_imports DROP CONSTRAINT IF EXISTS idea_imports_pkey;
ALTER TABLE IF EXISTS ONLY public.idea_import_files DROP CONSTRAINT IF EXISTS idea_import_files_pkey;
ALTER TABLE IF EXISTS ONLY public.idea_images DROP CONSTRAINT IF EXISTS idea_images_pkey;
ALTER TABLE IF EXISTS ONLY public.idea_files DROP CONSTRAINT IF EXISTS idea_files_pkey;
ALTER TABLE IF EXISTS ONLY public.groups_projects DROP CONSTRAINT IF EXISTS groups_projects_pkey;
ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_pkey;
ALTER TABLE IF EXISTS ONLY public.groups_permissions DROP CONSTRAINT IF EXISTS groups_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.followers DROP CONSTRAINT IF EXISTS followers_pkey;
ALTER TABLE IF EXISTS ONLY public.flag_inappropriate_content_inappropriate_content_flags DROP CONSTRAINT IF EXISTS flag_inappropriate_content_inappropriate_content_flags_pkey;
ALTER TABLE IF EXISTS ONLY public.experiments DROP CONSTRAINT IF EXISTS experiments_pkey;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_pkey;
ALTER TABLE IF EXISTS ONLY public.events_attendances DROP CONSTRAINT IF EXISTS events_attendances_pkey;
ALTER TABLE IF EXISTS ONLY public.event_images DROP CONSTRAINT IF EXISTS event_images_pkey;
ALTER TABLE IF EXISTS ONLY public.event_files DROP CONSTRAINT IF EXISTS event_files_pkey;
ALTER TABLE IF EXISTS ONLY public.embeddings_similarities DROP CONSTRAINT IF EXISTS embeddings_similarities_pkey;
ALTER TABLE IF EXISTS ONLY public.email_snippets DROP CONSTRAINT IF EXISTS email_snippets_pkey;
ALTER TABLE IF EXISTS ONLY public.email_campaigns_unsubscription_tokens DROP CONSTRAINT IF EXISTS email_campaigns_unsubscription_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.email_campaigns_examples DROP CONSTRAINT IF EXISTS email_campaigns_examples_pkey;
ALTER TABLE IF EXISTS ONLY public.email_campaigns_deliveries DROP CONSTRAINT IF EXISTS email_campaigns_deliveries_pkey;
ALTER TABLE IF EXISTS ONLY public.email_campaigns_consents DROP CONSTRAINT IF EXISTS email_campaigns_consents_pkey;
ALTER TABLE IF EXISTS ONLY public.email_campaigns_campaigns DROP CONSTRAINT IF EXISTS email_campaigns_campaigns_pkey;
ALTER TABLE IF EXISTS ONLY public.email_campaigns_campaigns_groups DROP CONSTRAINT IF EXISTS email_campaigns_campaigns_groups_pkey;
ALTER TABLE IF EXISTS ONLY public.email_campaigns_campaign_email_commands DROP CONSTRAINT IF EXISTS email_campaigns_campaign_email_commands_pkey;
ALTER TABLE IF EXISTS ONLY public.custom_forms DROP CONSTRAINT IF EXISTS custom_forms_pkey;
ALTER TABLE IF EXISTS ONLY public.custom_fields DROP CONSTRAINT IF EXISTS custom_fields_pkey;
ALTER TABLE IF EXISTS ONLY public.custom_field_options DROP CONSTRAINT IF EXISTS custom_field_options_pkey;
ALTER TABLE IF EXISTS ONLY public.custom_field_option_images DROP CONSTRAINT IF EXISTS custom_field_option_images_pkey;
ALTER TABLE IF EXISTS ONLY public.custom_field_matrix_statements DROP CONSTRAINT IF EXISTS custom_field_matrix_statements_pkey;
ALTER TABLE IF EXISTS ONLY public.custom_field_bins DROP CONSTRAINT IF EXISTS custom_field_bins_pkey;
ALTER TABLE IF EXISTS ONLY public.cosponsorships DROP CONSTRAINT IF EXISTS cosponsorships_pkey;
ALTER TABLE IF EXISTS ONLY public.content_builder_layouts DROP CONSTRAINT IF EXISTS content_builder_layouts_pkey;
ALTER TABLE IF EXISTS ONLY public.content_builder_layout_images DROP CONSTRAINT IF EXISTS content_builder_layout_images_pkey;
ALTER TABLE IF EXISTS ONLY public.common_passwords DROP CONSTRAINT IF EXISTS common_passwords_pkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_pkey;
ALTER TABLE IF EXISTS ONLY public.baskets DROP CONSTRAINT IF EXISTS baskets_pkey;
ALTER TABLE IF EXISTS ONLY public.baskets_ideas DROP CONSTRAINT IF EXISTS baskets_ideas_pkey;
ALTER TABLE IF EXISTS ONLY public.authoring_assistance_responses DROP CONSTRAINT IF EXISTS authoring_assistance_responses_pkey;
ALTER TABLE IF EXISTS ONLY public.areas_static_pages DROP CONSTRAINT IF EXISTS areas_static_pages_pkey;
ALTER TABLE IF EXISTS ONLY public.areas_projects DROP CONSTRAINT IF EXISTS areas_projects_pkey;
ALTER TABLE IF EXISTS ONLY public.areas DROP CONSTRAINT IF EXISTS areas_pkey;
ALTER TABLE IF EXISTS ONLY public.ar_internal_metadata DROP CONSTRAINT IF EXISTS ar_internal_metadata_pkey;
ALTER TABLE IF EXISTS ONLY public.app_configurations DROP CONSTRAINT IF EXISTS app_configurations_pkey;
ALTER TABLE IF EXISTS ONLY public.analytics_fact_visits DROP CONSTRAINT IF EXISTS analytics_fact_visits_pkey;
ALTER TABLE IF EXISTS ONLY public.analytics_dimension_types DROP CONSTRAINT IF EXISTS analytics_dimension_types_pkey;
ALTER TABLE IF EXISTS ONLY public.analytics_dimension_referrer_types DROP CONSTRAINT IF EXISTS analytics_dimension_referrer_types_pkey;
ALTER TABLE IF EXISTS ONLY public.analytics_dimension_locales DROP CONSTRAINT IF EXISTS analytics_dimension_locales_pkey;
ALTER TABLE IF EXISTS ONLY public.analytics_dimension_dates DROP CONSTRAINT IF EXISTS analytics_dimension_dates_pkey;
ALTER TABLE IF EXISTS ONLY public.analysis_tags DROP CONSTRAINT IF EXISTS analysis_tags_pkey;
ALTER TABLE IF EXISTS ONLY public.analysis_taggings DROP CONSTRAINT IF EXISTS analysis_taggings_pkey;
ALTER TABLE IF EXISTS ONLY public.analysis_summaries DROP CONSTRAINT IF EXISTS analysis_summaries_pkey;
ALTER TABLE IF EXISTS ONLY public.analysis_questions DROP CONSTRAINT IF EXISTS analysis_questions_pkey;
ALTER TABLE IF EXISTS ONLY public.analysis_insights DROP CONSTRAINT IF EXISTS analysis_insights_pkey;
ALTER TABLE IF EXISTS ONLY public.analysis_heatmap_cells DROP CONSTRAINT IF EXISTS analysis_heatmap_cells_pkey;
ALTER TABLE IF EXISTS ONLY public.analysis_comments_summaries DROP CONSTRAINT IF EXISTS analysis_comments_summaries_pkey;
ALTER TABLE IF EXISTS ONLY public.analysis_background_tasks DROP CONSTRAINT IF EXISTS analysis_background_tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.analysis_analyses DROP CONSTRAINT IF EXISTS analysis_analyses_pkey;
ALTER TABLE IF EXISTS ONLY public.analysis_additional_custom_fields DROP CONSTRAINT IF EXISTS analysis_analyses_custom_fields_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_publications DROP CONSTRAINT IF EXISTS admin_publications_pkey;
ALTER TABLE IF EXISTS ONLY public.activities DROP CONSTRAINT IF EXISTS activities_pkey;
ALTER TABLE IF EXISTS public.que_jobs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.areas_static_pages ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.verification_verifications;
DROP TABLE IF EXISTS public.user_custom_fields_representativeness_ref_distributions;
DROP TABLE IF EXISTS public.topics;
DROP TABLE IF EXISTS public.text_images;
DROP TABLE IF EXISTS public.tenants;
DROP TABLE IF EXISTS public.surveys_responses;
DROP TABLE IF EXISTS public.static_pages_topics;
DROP TABLE IF EXISTS public.static_pages;
DROP TABLE IF EXISTS public.static_page_files;
DROP TABLE IF EXISTS public.spam_reports;
DROP TABLE IF EXISTS public.schema_migrations;
DROP TABLE IF EXISTS public.report_builder_reports;
DROP TABLE IF EXISTS public.report_builder_published_graph_data_units;
DROP TABLE IF EXISTS public.que_values;
DROP TABLE IF EXISTS public.que_lockers;
DROP SEQUENCE IF EXISTS public.que_jobs_id_seq;
DROP TABLE IF EXISTS public.public_api_api_clients;
DROP TABLE IF EXISTS public.projects_topics;
DROP TABLE IF EXISTS public.projects_allowed_input_topics;
DROP TABLE IF EXISTS public.project_reviews;
DROP TABLE IF EXISTS public.project_images;
DROP TABLE IF EXISTS public.project_folders_images;
DROP TABLE IF EXISTS public.project_folders_folders;
DROP TABLE IF EXISTS public.project_folders_files;
DROP TABLE IF EXISTS public.project_files;
DROP TABLE IF EXISTS public.polls_response_options;
DROP TABLE IF EXISTS public.polls_questions;
DROP TABLE IF EXISTS public.polls_options;
DROP TABLE IF EXISTS public.phase_files;
DROP TABLE IF EXISTS public.permissions_custom_fields;
DROP TABLE IF EXISTS public.permissions;
DROP TABLE IF EXISTS public.onboarding_campaign_dismissals;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.nav_bar_items;
DROP VIEW IF EXISTS public.moderation_moderations;
DROP TABLE IF EXISTS public.moderation_moderation_statuses;
DROP TABLE IF EXISTS public.memberships;
DROP TABLE IF EXISTS public.maps_map_configs;
DROP TABLE IF EXISTS public.maps_layers;
DROP TABLE IF EXISTS public.machine_translations_machine_translations;
DROP TABLE IF EXISTS public.internal_comments;
DROP TABLE IF EXISTS public.impact_tracking_salts;
DROP TABLE IF EXISTS public.impact_tracking_pageviews;
DROP TABLE IF EXISTS public.identities;
DROP TABLE IF EXISTS public.ideas_topics;
DROP TABLE IF EXISTS public.ideas_phases;
DROP VIEW IF EXISTS public.idea_trending_infos;
DROP TABLE IF EXISTS public.idea_imports;
DROP TABLE IF EXISTS public.idea_import_files;
DROP TABLE IF EXISTS public.idea_images;
DROP TABLE IF EXISTS public.idea_files;
DROP TABLE IF EXISTS public.id_id_card_lookup_id_cards;
DROP TABLE IF EXISTS public.groups_projects;
DROP TABLE IF EXISTS public.groups_permissions;
DROP TABLE IF EXISTS public.groups;
DROP TABLE IF EXISTS public.followers;
DROP TABLE IF EXISTS public.flag_inappropriate_content_inappropriate_content_flags;
DROP TABLE IF EXISTS public.experiments;
DROP TABLE IF EXISTS public.event_images;
DROP TABLE IF EXISTS public.event_files;
DROP TABLE IF EXISTS public.embeddings_similarities;
DROP TABLE IF EXISTS public.email_snippets;
DROP TABLE IF EXISTS public.email_campaigns_unsubscription_tokens;
DROP TABLE IF EXISTS public.email_campaigns_examples;
DROP TABLE IF EXISTS public.email_campaigns_consents;
DROP TABLE IF EXISTS public.email_campaigns_campaigns_groups;
DROP TABLE IF EXISTS public.email_campaigns_campaign_email_commands;
DROP TABLE IF EXISTS public.custom_forms;
DROP TABLE IF EXISTS public.custom_fields;
DROP TABLE IF EXISTS public.custom_field_options;
DROP TABLE IF EXISTS public.custom_field_option_images;
DROP TABLE IF EXISTS public.custom_field_matrix_statements;
DROP TABLE IF EXISTS public.custom_field_bins;
DROP TABLE IF EXISTS public.cosponsorships;
DROP TABLE IF EXISTS public.content_builder_layouts;
DROP TABLE IF EXISTS public.content_builder_layout_images;
DROP TABLE IF EXISTS public.common_passwords;
DROP TABLE IF EXISTS public.baskets_ideas;
DROP TABLE IF EXISTS public.authoring_assistance_responses;
DROP SEQUENCE IF EXISTS public.areas_static_pages_id_seq;
DROP TABLE IF EXISTS public.areas_static_pages;
DROP TABLE IF EXISTS public.areas_projects;
DROP TABLE IF EXISTS public.areas;
DROP TABLE IF EXISTS public.ar_internal_metadata;
DROP TABLE IF EXISTS public.app_configurations;
DROP VIEW IF EXISTS public.analytics_fact_sessions;
DROP TABLE IF EXISTS public.impact_tracking_sessions;
DROP VIEW IF EXISTS public.analytics_fact_registrations;
DROP TABLE IF EXISTS public.invites;
DROP VIEW IF EXISTS public.analytics_fact_project_statuses;
DROP VIEW IF EXISTS public.analytics_fact_posts;
DROP VIEW IF EXISTS public.analytics_fact_participations;
DROP TABLE IF EXISTS public.volunteering_volunteers;
DROP TABLE IF EXISTS public.volunteering_causes;
DROP TABLE IF EXISTS public.reactions;
DROP TABLE IF EXISTS public.polls_responses;
DROP TABLE IF EXISTS public.phases;
DROP TABLE IF EXISTS public.ideas;
DROP TABLE IF EXISTS public.events_attendances;
DROP TABLE IF EXISTS public.comments;
DROP TABLE IF EXISTS public.baskets;
DROP VIEW IF EXISTS public.analytics_fact_events;
DROP TABLE IF EXISTS public.events;
DROP VIEW IF EXISTS public.analytics_fact_email_deliveries;
DROP TABLE IF EXISTS public.email_campaigns_deliveries;
DROP TABLE IF EXISTS public.email_campaigns_campaigns;
DROP VIEW IF EXISTS public.analytics_dimension_users;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.analytics_fact_visits;
DROP TABLE IF EXISTS public.analytics_dimension_types;
DROP VIEW IF EXISTS public.analytics_dimension_statuses;
DROP TABLE IF EXISTS public.idea_statuses;
DROP TABLE IF EXISTS public.analytics_dimension_referrer_types;
DROP TABLE IF EXISTS public.analytics_dimension_projects_fact_visits;
DROP VIEW IF EXISTS public.analytics_dimension_projects;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.analytics_dimension_locales_fact_visits;
DROP TABLE IF EXISTS public.analytics_dimension_locales;
DROP TABLE IF EXISTS public.analytics_dimension_dates;
DROP VIEW IF EXISTS public.analytics_build_feedbacks;
DROP TABLE IF EXISTS public.official_feedbacks;
DROP TABLE IF EXISTS public.analysis_tags;
DROP TABLE IF EXISTS public.analysis_taggings;
DROP TABLE IF EXISTS public.analysis_summaries;
DROP TABLE IF EXISTS public.analysis_questions;
DROP TABLE IF EXISTS public.analysis_insights;
DROP TABLE IF EXISTS public.analysis_heatmap_cells;
DROP TABLE IF EXISTS public.analysis_comments_summaries;
DROP TABLE IF EXISTS public.analysis_background_tasks;
DROP TABLE IF EXISTS public.analysis_analyses;
DROP TABLE IF EXISTS public.analysis_additional_custom_fields;
DROP TABLE IF EXISTS public.admin_publications;
DROP TABLE IF EXISTS public.activities;
DROP FUNCTION IF EXISTS public.que_state_notify();
DROP FUNCTION IF EXISTS public.que_job_notify();
DROP FUNCTION IF EXISTS public.que_determine_job_state(job public.que_jobs);
DROP TABLE IF EXISTS public.que_jobs;
DROP FUNCTION IF EXISTS public.que_validate_tags(tags_array jsonb);
DROP EXTENSION IF EXISTS vector;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS postgis;
DROP EXTENSION IF EXISTS pgcrypto;
DROP SCHEMA IF EXISTS shared_extensions;
DROP SCHEMA IF EXISTS public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: shared_extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA shared_extensions;


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA shared_extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA shared_extensions;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA shared_extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA shared_extensions;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'Open-source vector similarity search for Postgres';


--
-- Name: que_validate_tags(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.que_validate_tags(tags_array jsonb) RETURNS boolean
    LANGUAGE sql
    AS $$
  SELECT bool_and(
    jsonb_typeof(value) = 'string'
    AND
    char_length(value::text) <= 100
  )
  FROM jsonb_array_elements(tags_array)
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: que_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.que_jobs (
    priority smallint DEFAULT 100 NOT NULL,
    run_at timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL,
    job_class text NOT NULL,
    error_count integer DEFAULT 0 NOT NULL,
    last_error_message text,
    queue text DEFAULT 'default'::text NOT NULL,
    last_error_backtrace text,
    finished_at timestamp with time zone,
    expired_at timestamp with time zone,
    args jsonb DEFAULT '[]'::jsonb NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    job_schema_version integer NOT NULL,
    kwargs jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT error_length CHECK (((char_length(last_error_message) <= 500) AND (char_length(last_error_backtrace) <= 10000))),
    CONSTRAINT job_class_length CHECK ((char_length(
CASE job_class
    WHEN 'ActiveJob::QueueAdapters::QueAdapter::JobWrapper'::text THEN ((args -> 0) ->> 'job_class'::text)
    ELSE job_class
END) <= 200)),
    CONSTRAINT queue_length CHECK ((char_length(queue) <= 100)),
    CONSTRAINT valid_args CHECK ((jsonb_typeof(args) = 'array'::text)),
    CONSTRAINT valid_data CHECK (((jsonb_typeof(data) = 'object'::text) AND ((NOT (data ? 'tags'::text)) OR ((jsonb_typeof((data -> 'tags'::text)) = 'array'::text) AND (jsonb_array_length((data -> 'tags'::text)) <= 5) AND public.que_validate_tags((data -> 'tags'::text))))))
)
WITH (fillfactor='90');


--
-- Name: TABLE que_jobs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.que_jobs IS '6';


--
-- Name: que_determine_job_state(public.que_jobs); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.que_determine_job_state(job public.que_jobs) RETURNS text
    LANGUAGE sql
    AS $$
  SELECT
    CASE
    WHEN job.expired_at  IS NOT NULL    THEN 'expired'
    WHEN job.finished_at IS NOT NULL    THEN 'finished'
    WHEN job.error_count > 0            THEN 'errored'
    WHEN job.run_at > CURRENT_TIMESTAMP THEN 'scheduled'
    ELSE                                     'ready'
    END
$$;


--
-- Name: que_job_notify(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.que_job_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    locker_pid integer;
    sort_key json;
  BEGIN
    -- Don't do anything if the job is scheduled for a future time.
    IF NEW.run_at IS NOT NULL AND NEW.run_at > now() THEN
      RETURN null;
    END IF;

    -- Pick a locker to notify of the job's insertion, weighted by their number
    -- of workers. Should bounce pseudorandomly between lockers on each
    -- invocation, hence the md5-ordering, but still touch each one equally,
    -- hence the modulo using the job_id.
    SELECT pid
    INTO locker_pid
    FROM (
      SELECT *, last_value(row_number) OVER () + 1 AS count
      FROM (
        SELECT *, row_number() OVER () - 1 AS row_number
        FROM (
          SELECT *
          FROM public.que_lockers ql, generate_series(1, ql.worker_count) AS id
          WHERE
            listening AND
            queues @> ARRAY[NEW.queue] AND
            ql.job_schema_version = NEW.job_schema_version
          ORDER BY md5(pid::text || id::text)
        ) t1
      ) t2
    ) t3
    WHERE NEW.id % count = row_number;

    IF locker_pid IS NOT NULL THEN
      -- There's a size limit to what can be broadcast via LISTEN/NOTIFY, so
      -- rather than throw errors when someone enqueues a big job, just
      -- broadcast the most pertinent information, and let the locker query for
      -- the record after it's taken the lock. The worker will have to hit the
      -- DB in order to make sure the job is still visible anyway.
      SELECT row_to_json(t)
      INTO sort_key
      FROM (
        SELECT
          'job_available' AS message_type,
          NEW.queue       AS queue,
          NEW.priority    AS priority,
          NEW.id          AS id,
          -- Make sure we output timestamps as UTC ISO 8601
          to_char(NEW.run_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS run_at
      ) t;

      PERFORM pg_notify('que_listener_' || locker_pid::text, sort_key::text);
    END IF;

    RETURN null;
  END
$$;


--
-- Name: que_state_notify(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.que_state_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    row record;
    message json;
    previous_state text;
    current_state text;
  BEGIN
    IF TG_OP = 'INSERT' THEN
      previous_state := 'nonexistent';
      current_state  := public.que_determine_job_state(NEW);
      row            := NEW;
    ELSIF TG_OP = 'DELETE' THEN
      previous_state := public.que_determine_job_state(OLD);
      current_state  := 'nonexistent';
      row            := OLD;
    ELSIF TG_OP = 'UPDATE' THEN
      previous_state := public.que_determine_job_state(OLD);
      current_state  := public.que_determine_job_state(NEW);

      -- If the state didn't change, short-circuit.
      IF previous_state = current_state THEN
        RETURN null;
      END IF;

      row := NEW;
    ELSE
      RAISE EXCEPTION 'Unrecognized TG_OP: %', TG_OP;
    END IF;

    SELECT row_to_json(t)
    INTO message
    FROM (
      SELECT
        'job_change' AS message_type,
        row.id       AS id,
        row.queue    AS queue,

        coalesce(row.data->'tags', '[]'::jsonb) AS tags,

        to_char(row.run_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS run_at,
        to_char(now()      AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS time,

        CASE row.job_class
        WHEN 'ActiveJob::QueueAdapters::QueAdapter::JobWrapper' THEN
          coalesce(
            row.args->0->>'job_class',
            'ActiveJob::QueueAdapters::QueAdapter::JobWrapper'
          )
        ELSE
          row.job_class
        END AS job_class,

        previous_state AS previous_state,
        current_state  AS current_state
    ) t;

    PERFORM pg_notify('que_state', message::text);

    RETURN null;
  END
$$;


--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activities (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    item_type character varying NOT NULL,
    item_id uuid NOT NULL,
    action character varying NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    user_id uuid,
    acted_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL,
    project_id uuid
);


--
-- Name: admin_publications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_publications (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    parent_id uuid,
    lft integer NOT NULL,
    rgt integer NOT NULL,
    ordering integer,
    publication_status character varying DEFAULT 'published'::character varying NOT NULL,
    publication_id uuid,
    publication_type character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    depth integer DEFAULT 0 NOT NULL,
    children_allowed boolean DEFAULT true NOT NULL,
    children_count integer DEFAULT 0 NOT NULL,
    first_published_at timestamp(6) without time zone
);


--
-- Name: analysis_additional_custom_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_additional_custom_fields (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    analysis_id uuid NOT NULL,
    custom_field_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: analysis_analyses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_analyses (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_id uuid,
    phase_id uuid,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    show_insights boolean DEFAULT true NOT NULL,
    main_custom_field_id uuid
);


--
-- Name: analysis_background_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_background_tasks (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    analysis_id uuid NOT NULL,
    type character varying NOT NULL,
    state character varying NOT NULL,
    progress double precision,
    started_at timestamp(6) without time zone,
    ended_at timestamp(6) without time zone,
    auto_tagging_method character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tags_ids jsonb,
    filters jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: analysis_comments_summaries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_comments_summaries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    idea_id uuid,
    background_task_id uuid NOT NULL,
    summary text,
    prompt text,
    accuracy double precision,
    generated_at timestamp(6) without time zone,
    comments_ids jsonb NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: analysis_heatmap_cells; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_heatmap_cells (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    analysis_id uuid NOT NULL,
    row_type character varying NOT NULL,
    row_id uuid NOT NULL,
    column_type character varying NOT NULL,
    column_id uuid NOT NULL,
    unit character varying NOT NULL,
    count integer NOT NULL,
    lift numeric(20,15) NOT NULL,
    p_value numeric(20,15) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: analysis_insights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_insights (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    analysis_id uuid NOT NULL,
    insightable_type character varying NOT NULL,
    insightable_id uuid NOT NULL,
    filters jsonb DEFAULT '{}'::jsonb NOT NULL,
    inputs_ids jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    custom_field_ids jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: analysis_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_questions (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    background_task_id uuid NOT NULL,
    question text,
    answer text,
    prompt text,
    q_and_a_method character varying NOT NULL,
    accuracy double precision,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    generated_at timestamp without time zone
);


--
-- Name: analysis_summaries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_summaries (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    background_task_id uuid NOT NULL,
    summary text,
    prompt text,
    summarization_method character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    accuracy double precision,
    generated_at timestamp without time zone
);


--
-- Name: analysis_taggings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_taggings (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    tag_id uuid NOT NULL,
    input_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    background_task_id uuid
);


--
-- Name: analysis_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_tags (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    tag_type character varying NOT NULL,
    analysis_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: official_feedbacks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.official_feedbacks (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    body_multiloc jsonb DEFAULT '{}'::jsonb,
    author_multiloc jsonb DEFAULT '{}'::jsonb,
    user_id uuid,
    idea_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: analytics_build_feedbacks; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.analytics_build_feedbacks AS
 SELECT post_id,
    min(feedback_first_date) AS feedback_first_date,
    max(feedback_official) AS feedback_official,
    max(feedback_status_change) AS feedback_status_change
   FROM ( SELECT activities.item_id AS post_id,
            min(activities.created_at) AS feedback_first_date,
            0 AS feedback_official,
            1 AS feedback_status_change
           FROM public.activities
          WHERE (((activities.action)::text = 'changed_status'::text) AND ((activities.item_type)::text = 'Idea'::text))
          GROUP BY activities.item_id
        UNION ALL
         SELECT official_feedbacks.idea_id AS post_id,
            min(official_feedbacks.created_at) AS feedback_first_date,
            1 AS feedback_official,
            0 AS feedback_status_change
           FROM public.official_feedbacks
          GROUP BY official_feedbacks.idea_id) a
  GROUP BY post_id;


--
-- Name: analytics_dimension_dates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_dimension_dates (
    date date NOT NULL,
    year character varying,
    month character varying,
    week date
);


--
-- Name: analytics_dimension_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_dimension_locales (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- Name: analytics_dimension_locales_fact_visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_dimension_locales_fact_visits (
    dimension_locale_id uuid,
    fact_visit_id uuid
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    slug character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    header_bg character varying,
    ideas_count integer DEFAULT 0 NOT NULL,
    visible_to character varying DEFAULT 'public'::character varying NOT NULL,
    description_preview_multiloc jsonb DEFAULT '{}'::jsonb,
    internal_role character varying,
    comments_count integer DEFAULT 0 NOT NULL,
    default_assignee_id uuid,
    include_all_areas boolean DEFAULT false NOT NULL,
    baskets_count integer DEFAULT 0 NOT NULL,
    votes_count integer DEFAULT 0 NOT NULL,
    followers_count integer DEFAULT 0 NOT NULL,
    preview_token character varying NOT NULL,
    header_bg_alt_text_multiloc jsonb DEFAULT '{}'::jsonb,
    hidden boolean DEFAULT false NOT NULL
);


--
-- Name: analytics_dimension_projects; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.analytics_dimension_projects AS
 SELECT id,
    title_multiloc
   FROM public.projects;


--
-- Name: analytics_dimension_projects_fact_visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_dimension_projects_fact_visits (
    dimension_project_id uuid,
    fact_visit_id uuid
);


--
-- Name: analytics_dimension_referrer_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_dimension_referrer_types (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    key character varying NOT NULL,
    name character varying NOT NULL
);


--
-- Name: idea_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idea_statuses (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    ordering integer,
    code character varying,
    color character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    ideas_count integer DEFAULT 0,
    participation_method character varying DEFAULT 'ideation'::character varying NOT NULL
);


--
-- Name: analytics_dimension_statuses; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.analytics_dimension_statuses AS
 SELECT id,
    title_multiloc,
    code,
    color
   FROM public.idea_statuses;


--
-- Name: analytics_dimension_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_dimension_types (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    name character varying,
    parent character varying
);


--
-- Name: analytics_fact_visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_fact_visits (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    visitor_id character varying NOT NULL,
    dimension_user_id uuid,
    dimension_referrer_type_id uuid NOT NULL,
    dimension_date_first_action_id date NOT NULL,
    dimension_date_last_action_id date NOT NULL,
    duration integer NOT NULL,
    pages_visited integer NOT NULL,
    returning_visitor boolean DEFAULT false NOT NULL,
    referrer_name character varying,
    referrer_url character varying,
    matomo_visit_id integer NOT NULL,
    matomo_last_action_time timestamp without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    email character varying,
    password_digest character varying,
    slug character varying,
    roles jsonb DEFAULT '[]'::jsonb,
    reset_password_token character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    avatar character varying,
    first_name character varying,
    last_name character varying,
    locale character varying,
    bio_multiloc jsonb DEFAULT '{}'::jsonb,
    invite_status character varying,
    custom_field_values jsonb DEFAULT '{}'::jsonb,
    registration_completed_at timestamp without time zone,
    verified boolean DEFAULT false NOT NULL,
    email_confirmed_at timestamp without time zone,
    email_confirmation_code character varying,
    email_confirmation_retry_count integer DEFAULT 0 NOT NULL,
    email_confirmation_code_reset_count integer DEFAULT 0 NOT NULL,
    email_confirmation_code_sent_at timestamp without time zone,
    confirmation_required boolean DEFAULT true NOT NULL,
    block_start_at timestamp without time zone,
    block_reason character varying,
    block_end_at timestamp without time zone,
    new_email character varying,
    followings_count integer DEFAULT 0 NOT NULL,
    onboarding jsonb DEFAULT '{}'::jsonb NOT NULL,
    unique_code character varying,
    last_active_at timestamp(6) without time zone
);


--
-- Name: analytics_dimension_users; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.analytics_dimension_users AS
 SELECT u.id,
    COALESCE(((u.roles -> 0) ->> 'type'::text), 'citizen'::text) AS role,
    u.invite_status,
    (users_with_visits.dimension_user_id IS NOT NULL) AS has_visits
   FROM (public.users u
     LEFT JOIN ( SELECT DISTINCT analytics_fact_visits.dimension_user_id
           FROM public.analytics_fact_visits) users_with_visits ON ((users_with_visits.dimension_user_id = u.id)));


--
-- Name: email_campaigns_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns_campaigns (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    type character varying NOT NULL,
    author_id uuid,
    enabled boolean,
    sender character varying,
    reply_to character varying,
    schedule jsonb DEFAULT '{}'::jsonb,
    subject_multiloc jsonb DEFAULT '{}'::jsonb,
    body_multiloc jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deliveries_count integer DEFAULT 0 NOT NULL,
    context_id uuid
);


--
-- Name: email_campaigns_deliveries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns_deliveries (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    user_id uuid NOT NULL,
    delivery_status character varying NOT NULL,
    tracked_content jsonb DEFAULT '{}'::jsonb,
    sent_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: analytics_fact_email_deliveries; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.analytics_fact_email_deliveries AS
 SELECT ecd.id,
    (ecd.sent_at)::date AS dimension_date_sent_id,
    ecd.campaign_id,
    p.id AS dimension_project_id,
    ((ecc.type)::text <> ALL (ARRAY[('EmailCampaigns::Campaigns::Manual'::character varying)::text, ('EmailCampaigns::Campaigns::ManualProjectParticipants'::character varying)::text])) AS automated
   FROM ((public.email_campaigns_deliveries ecd
     JOIN public.email_campaigns_campaigns ecc ON ((ecc.id = ecd.campaign_id)))
     LEFT JOIN public.projects p ON ((p.id = ecc.context_id)));


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_id uuid,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    location_multiloc jsonb DEFAULT '{}'::json,
    start_at timestamp without time zone,
    end_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    location_point shared_extensions.geography(Point,4326),
    address_1 character varying,
    attendees_count integer DEFAULT 0 NOT NULL,
    address_2_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    online_link character varying,
    attend_button_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    using_url character varying
);


--
-- Name: analytics_fact_events; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.analytics_fact_events AS
 SELECT id,
    project_id AS dimension_project_id,
    (created_at)::date AS dimension_date_created_id,
    (start_at)::date AS dimension_date_start_id,
    (end_at)::date AS dimension_date_end_id
   FROM public.events;


--
-- Name: baskets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.baskets (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    submitted_at timestamp without time zone,
    user_id uuid,
    phase_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    author_id uuid,
    idea_id uuid,
    parent_id uuid,
    lft integer NOT NULL,
    rgt integer NOT NULL,
    body_multiloc jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    likes_count integer DEFAULT 0 NOT NULL,
    dislikes_count integer DEFAULT 0 NOT NULL,
    publication_status character varying DEFAULT 'published'::character varying NOT NULL,
    body_updated_at timestamp without time zone,
    children_count integer DEFAULT 0 NOT NULL,
    author_hash character varying,
    anonymous boolean DEFAULT false NOT NULL
);


--
-- Name: events_attendances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_attendances (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    attendee_id uuid NOT NULL,
    event_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: ideas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ideas (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    body_multiloc jsonb DEFAULT '{}'::jsonb,
    publication_status character varying,
    published_at timestamp without time zone,
    project_id uuid,
    author_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    likes_count integer DEFAULT 0 NOT NULL,
    dislikes_count integer DEFAULT 0 NOT NULL,
    location_point shared_extensions.geography(Point,4326),
    location_description character varying,
    comments_count integer DEFAULT 0 NOT NULL,
    idea_status_id uuid,
    slug character varying,
    budget integer,
    baskets_count integer DEFAULT 0 NOT NULL,
    official_feedbacks_count integer DEFAULT 0 NOT NULL,
    assignee_id uuid,
    assigned_at timestamp without time zone,
    proposed_budget integer,
    custom_field_values jsonb DEFAULT '{}'::jsonb NOT NULL,
    creation_phase_id uuid,
    author_hash character varying,
    anonymous boolean DEFAULT false NOT NULL,
    internal_comments_count integer DEFAULT 0 NOT NULL,
    votes_count integer DEFAULT 0 NOT NULL,
    followers_count integer DEFAULT 0 NOT NULL,
    submitted_at timestamp(6) without time zone,
    manual_votes_amount integer,
    manual_votes_last_updated_by_id uuid,
    manual_votes_last_updated_at timestamp(6) without time zone,
    neutral_reactions_count integer DEFAULT 0 NOT NULL
);


--
-- Name: phases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.phases (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_id uuid,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    start_at date,
    end_at date,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    participation_method character varying DEFAULT 'ideation'::character varying NOT NULL,
    submission_enabled boolean DEFAULT true,
    commenting_enabled boolean DEFAULT true,
    reacting_enabled boolean DEFAULT true NOT NULL,
    reacting_like_method character varying DEFAULT 'unlimited'::character varying NOT NULL,
    reacting_like_limited_max integer DEFAULT 10,
    survey_embed_url character varying,
    survey_service character varying,
    presentation_mode character varying DEFAULT 'card'::character varying,
    voting_max_total integer,
    poll_anonymous boolean DEFAULT false NOT NULL,
    reacting_dislike_enabled boolean DEFAULT false NOT NULL,
    ideas_count integer DEFAULT 0 NOT NULL,
    ideas_order character varying,
    input_term character varying DEFAULT 'idea'::character varying,
    voting_min_total integer DEFAULT 0,
    reacting_dislike_method character varying DEFAULT 'unlimited'::character varying NOT NULL,
    reacting_dislike_limited_max integer DEFAULT 10,
    allow_anonymous_participation boolean DEFAULT false NOT NULL,
    document_annotation_embed_url character varying,
    voting_method character varying,
    voting_max_votes_per_idea integer,
    voting_term_singular_multiloc jsonb DEFAULT '{}'::jsonb,
    voting_term_plural_multiloc jsonb DEFAULT '{}'::jsonb,
    baskets_count integer DEFAULT 0 NOT NULL,
    votes_count integer DEFAULT 0 NOT NULL,
    campaigns_settings jsonb DEFAULT '{}'::jsonb,
    native_survey_title_multiloc jsonb DEFAULT '{}'::jsonb,
    native_survey_button_multiloc jsonb DEFAULT '{}'::jsonb,
    expire_days_limit integer,
    reacting_threshold integer,
    prescreening_enabled boolean DEFAULT false NOT NULL,
    autoshare_results_enabled boolean DEFAULT true NOT NULL,
    manual_votes_count integer DEFAULT 0 NOT NULL,
    manual_voters_amount integer,
    manual_voters_last_updated_by_id uuid,
    manual_voters_last_updated_at timestamp(6) without time zone,
    survey_popup_frequency integer,
    similarity_threshold_title double precision DEFAULT 0.3,
    similarity_threshold_body double precision DEFAULT 0.4,
    similarity_enabled boolean DEFAULT true NOT NULL,
    user_fields_in_form boolean DEFAULT false NOT NULL
);


--
-- Name: polls_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.polls_responses (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    phase_id uuid NOT NULL,
    user_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reactions (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    reactable_id uuid,
    reactable_type character varying,
    user_id uuid,
    mode character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: volunteering_causes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteering_causes (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    phase_id uuid NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    description_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    volunteers_count integer DEFAULT 0 NOT NULL,
    image character varying,
    ordering integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: volunteering_volunteers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteering_volunteers (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    cause_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: analytics_fact_participations; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.analytics_fact_participations AS
 SELECT i.id,
    i.author_id AS dimension_user_id,
    COALESCE((i.author_id)::text, (i.author_hash)::text, (i.id)::text) AS participant_id,
    i.project_id AS dimension_project_id,
        CASE
            WHEN ((ph.participation_method)::text = 'native_survey'::text) THEN survey.id
            ELSE idea.id
        END AS dimension_type_id,
    (i.created_at)::date AS dimension_date_created_id,
    (i.likes_count + i.dislikes_count) AS reactions_count,
    i.likes_count,
    i.dislikes_count
   FROM ((((public.ideas i
     LEFT JOIN public.projects pr ON ((pr.id = i.project_id)))
     LEFT JOIN public.phases ph ON ((ph.id = i.creation_phase_id)))
     JOIN public.analytics_dimension_types idea ON (((idea.name)::text = 'idea'::text)))
     LEFT JOIN public.analytics_dimension_types survey ON (((survey.name)::text = 'survey'::text)))
  WHERE ((i.publication_status)::text = 'published'::text)
UNION ALL
 SELECT c.id,
    c.author_id AS dimension_user_id,
    COALESCE((c.author_id)::text, (c.author_hash)::text, (c.id)::text) AS participant_id,
    i.project_id AS dimension_project_id,
    adt.id AS dimension_type_id,
    (c.created_at)::date AS dimension_date_created_id,
    (c.likes_count + c.dislikes_count) AS reactions_count,
    c.likes_count,
    c.dislikes_count
   FROM ((public.comments c
     JOIN public.analytics_dimension_types adt ON ((((adt.name)::text = 'comment'::text) AND ((adt.parent)::text = 'idea'::text))))
     LEFT JOIN public.ideas i ON ((c.idea_id = i.id)))
UNION ALL
 SELECT r.id,
    r.user_id AS dimension_user_id,
    COALESCE((r.user_id)::text, (r.id)::text) AS participant_id,
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
   FROM ((((public.reactions r
     JOIN public.analytics_dimension_types adt ON ((((adt.name)::text = 'reaction'::text) AND ((adt.parent)::text = lower((r.reactable_type)::text)))))
     LEFT JOIN public.ideas i ON ((i.id = r.reactable_id)))
     LEFT JOIN public.comments c ON ((c.id = r.reactable_id)))
     LEFT JOIN public.ideas ic ON ((ic.id = c.idea_id)))
UNION ALL
 SELECT pr.id,
    pr.user_id AS dimension_user_id,
    COALESCE((pr.user_id)::text, (pr.id)::text) AS participant_id,
    p.project_id AS dimension_project_id,
    adt.id AS dimension_type_id,
    (pr.created_at)::date AS dimension_date_created_id,
    0 AS reactions_count,
    0 AS likes_count,
    0 AS dislikes_count
   FROM ((public.polls_responses pr
     LEFT JOIN public.phases p ON ((p.id = pr.phase_id)))
     JOIN public.analytics_dimension_types adt ON (((adt.name)::text = 'poll'::text)))
UNION ALL
 SELECT vv.id,
    vv.user_id AS dimension_user_id,
    COALESCE((vv.user_id)::text, (vv.id)::text) AS participant_id,
    p.project_id AS dimension_project_id,
    adt.id AS dimension_type_id,
    (vv.created_at)::date AS dimension_date_created_id,
    0 AS reactions_count,
    0 AS likes_count,
    0 AS dislikes_count
   FROM (((public.volunteering_volunteers vv
     LEFT JOIN public.volunteering_causes vc ON ((vc.id = vv.cause_id)))
     LEFT JOIN public.phases p ON ((p.id = vc.phase_id)))
     JOIN public.analytics_dimension_types adt ON (((adt.name)::text = 'volunteer'::text)))
UNION ALL
 SELECT b.id,
    b.user_id AS dimension_user_id,
    COALESCE((b.user_id)::text, (b.id)::text) AS participant_id,
    p.project_id AS dimension_project_id,
    adt.id AS dimension_type_id,
    (b.created_at)::date AS dimension_date_created_id,
    0 AS reactions_count,
    0 AS likes_count,
    0 AS dislikes_count
   FROM ((public.baskets b
     LEFT JOIN public.phases p ON ((p.id = b.phase_id)))
     JOIN public.analytics_dimension_types adt ON (((adt.name)::text = 'basket'::text)))
UNION ALL
 SELECT ea.id,
    ea.attendee_id AS dimension_user_id,
    (ea.attendee_id)::text AS participant_id,
    e.project_id AS dimension_project_id,
    adt.id AS dimension_type_id,
    (ea.created_at)::date AS dimension_date_created_id,
    0 AS reactions_count,
    0 AS likes_count,
    0 AS dislikes_count
   FROM ((public.events_attendances ea
     LEFT JOIN public.events e ON ((e.id = ea.event_id)))
     JOIN public.analytics_dimension_types adt ON (((adt.name)::text = 'event_attendance'::text)));


--
-- Name: analytics_fact_posts; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.analytics_fact_posts AS
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
   FROM (((public.ideas i
     LEFT JOIN public.analytics_build_feedbacks abf ON ((abf.post_id = i.id)))
     LEFT JOIN public.phases creation_phase ON ((i.creation_phase_id = creation_phase.id)))
     JOIN public.analytics_dimension_types adt ON (((adt.name)::text =
        CASE
            WHEN (creation_phase.* IS NULL) THEN 'idea'::text
            WHEN ((creation_phase.participation_method)::text = 'proposals'::text) THEN 'proposal'::text
            ELSE NULL::text
        END)))
  WHERE ((creation_phase.* IS NULL) OR ((creation_phase.participation_method)::text = 'proposals'::text));


--
-- Name: analytics_fact_project_statuses; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.analytics_fact_project_statuses AS
 WITH finished_statuses_for_timeline_projects AS (
         SELECT phases.project_id,
            ((max(phases.end_at) + 1))::timestamp without time zone AS "timestamp"
           FROM public.phases
          GROUP BY phases.project_id
         HAVING (max(phases.end_at) < now())
        )
 SELECT ap.publication_id AS dimension_project_id,
    ap.publication_status AS status,
    (((ap.publication_status)::text = 'archived'::text) OR ((fsftp.project_id IS NOT NULL) AND ((ap.publication_status)::text <> 'draft'::text))) AS finished,
    COALESCE(fsftp."timestamp", ap.updated_at) AS "timestamp",
    COALESCE((fsftp."timestamp")::date, (ap.updated_at)::date) AS dimension_date_id
   FROM ((public.admin_publications ap
     LEFT JOIN public.projects p ON ((ap.publication_id = p.id)))
     LEFT JOIN finished_statuses_for_timeline_projects fsftp ON ((fsftp.project_id = ap.publication_id)))
  WHERE ((ap.publication_type)::text = 'Project'::text);


--
-- Name: invites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invites (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    token character varying NOT NULL,
    inviter_id uuid,
    invitee_id uuid NOT NULL,
    invite_text character varying,
    accepted_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    send_invite_email boolean DEFAULT true NOT NULL
);


--
-- Name: analytics_fact_registrations; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.analytics_fact_registrations AS
 SELECT u.id,
    u.id AS dimension_user_id,
    (u.registration_completed_at)::date AS dimension_date_registration_id,
    (i.created_at)::date AS dimension_date_invited_id,
    (i.accepted_at)::date AS dimension_date_accepted_id
   FROM (public.users u
     LEFT JOIN public.invites i ON ((i.invitee_id = u.id)));


--
-- Name: impact_tracking_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.impact_tracking_sessions (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    monthly_user_hash character varying NOT NULL,
    highest_role character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    user_id uuid,
    referrer character varying,
    device_type character varying,
    browser_name character varying,
    os_name character varying
);


--
-- Name: analytics_fact_sessions; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.analytics_fact_sessions AS
 SELECT id,
    monthly_user_hash,
    (created_at)::date AS dimension_date_created_id,
    (updated_at)::date AS dimension_date_updated_id,
    user_id AS dimension_user_id
   FROM public.impact_tracking_sessions;


--
-- Name: app_configurations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_configurations (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    name character varying,
    host character varying,
    logo character varying,
    favicon character varying,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    style jsonb DEFAULT '{}'::jsonb
);


--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.areas (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    ordering integer,
    custom_field_option_id uuid,
    followers_count integer DEFAULT 0 NOT NULL,
    include_in_onboarding boolean DEFAULT false NOT NULL
);


--
-- Name: areas_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.areas_projects (
    area_id uuid,
    project_id uuid,
    id uuid DEFAULT shared_extensions.uuid_generate_v4() NOT NULL
);


--
-- Name: areas_static_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.areas_static_pages (
    id bigint NOT NULL,
    area_id uuid NOT NULL,
    static_page_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: areas_static_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.areas_static_pages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: areas_static_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.areas_static_pages_id_seq OWNED BY public.areas_static_pages.id;


--
-- Name: authoring_assistance_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.authoring_assistance_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    idea_id uuid NOT NULL,
    prompt_response jsonb DEFAULT '{}'::jsonb NOT NULL,
    custom_free_prompt character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: baskets_ideas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.baskets_ideas (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    basket_id uuid,
    idea_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    votes integer DEFAULT 1 NOT NULL
);


--
-- Name: common_passwords; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.common_passwords (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    password character varying
);


--
-- Name: content_builder_layout_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_builder_layout_images (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    image character varying,
    code character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: content_builder_layouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_builder_layouts (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    content_buildable_type character varying,
    content_buildable_id uuid,
    code character varying NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    craftjs_json jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: cosponsorships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cosponsorships (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    user_id uuid NOT NULL,
    idea_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: custom_field_bins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_field_bins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type character varying NOT NULL,
    custom_field_id uuid,
    custom_field_option_id uuid,
    "values" jsonb,
    range int4range,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: custom_field_matrix_statements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_field_matrix_statements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    custom_field_id uuid NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    key character varying NOT NULL,
    ordering integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: custom_field_option_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_field_option_images (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    custom_field_option_id uuid,
    image character varying,
    ordering integer DEFAULT 0,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: custom_field_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_field_options (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    custom_field_id uuid,
    key character varying,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    other boolean DEFAULT false NOT NULL
);


--
-- Name: custom_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_fields (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    resource_type character varying,
    key character varying,
    input_type character varying,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    required boolean DEFAULT false,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    code character varying,
    resource_id uuid,
    hidden boolean DEFAULT false NOT NULL,
    maximum integer,
    logic jsonb DEFAULT '{}'::jsonb NOT NULL,
    select_count_enabled boolean DEFAULT false NOT NULL,
    maximum_select_count integer,
    minimum_select_count integer,
    random_option_ordering boolean DEFAULT false NOT NULL,
    page_layout character varying,
    linear_scale_label_1_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    linear_scale_label_2_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    linear_scale_label_3_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    linear_scale_label_4_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    linear_scale_label_5_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    linear_scale_label_6_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    linear_scale_label_7_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    dropdown_layout boolean DEFAULT false NOT NULL,
    linear_scale_label_8_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    linear_scale_label_9_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    linear_scale_label_10_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    linear_scale_label_11_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    ask_follow_up boolean DEFAULT false NOT NULL,
    page_button_label_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    page_button_link character varying,
    question_category character varying,
    include_in_printed_form boolean DEFAULT true NOT NULL
);


--
-- Name: custom_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_forms (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    participation_context_id uuid NOT NULL,
    participation_context_type character varying NOT NULL,
    fields_last_updated_at timestamp(6) without time zone DEFAULT now() NOT NULL,
    print_start_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    print_end_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    print_personal_data_fields boolean DEFAULT false NOT NULL
);


--
-- Name: email_campaigns_campaign_email_commands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns_campaign_email_commands (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    campaign character varying,
    recipient_id uuid,
    commanded_at timestamp without time zone,
    tracked_content jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: email_campaigns_campaigns_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns_campaigns_groups (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    campaign_id uuid,
    group_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: email_campaigns_consents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns_consents (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    campaign_type character varying NOT NULL,
    user_id uuid NOT NULL,
    consented boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: email_campaigns_examples; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns_examples (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    mail_body_html character varying NOT NULL,
    locale character varying NOT NULL,
    subject character varying NOT NULL,
    recipient_id uuid,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    campaign_id uuid
);


--
-- Name: email_campaigns_unsubscription_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns_unsubscription_tokens (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    token character varying NOT NULL,
    user_id uuid NOT NULL
);


--
-- Name: email_snippets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_snippets (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    email character varying,
    snippet character varying,
    locale character varying,
    body text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: embeddings_similarities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.embeddings_similarities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    embedding shared_extensions.vector(1024) NOT NULL,
    embeddable_type character varying NOT NULL,
    embeddable_id uuid NOT NULL,
    embedded_attributes character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: event_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    event_id uuid,
    file character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    name character varying
);


--
-- Name: event_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_images (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    event_id uuid,
    image character varying,
    ordering integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    alt_text_multiloc jsonb DEFAULT '{}'::jsonb
);


--
-- Name: experiments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.experiments (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    treatment character varying NOT NULL,
    action character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: flag_inappropriate_content_inappropriate_content_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flag_inappropriate_content_inappropriate_content_flags (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    flaggable_id uuid NOT NULL,
    flaggable_type character varying NOT NULL,
    deleted_at timestamp without time zone,
    toxicity_label character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    ai_reason character varying
);


--
-- Name: followers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.followers (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    followable_type character varying NOT NULL,
    followable_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    slug character varying,
    memberships_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    membership_type character varying,
    rules jsonb DEFAULT '[]'::jsonb
);


--
-- Name: groups_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups_permissions (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    permission_id uuid NOT NULL,
    group_id uuid NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: groups_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups_projects (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    group_id uuid,
    project_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: id_id_card_lookup_id_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.id_id_card_lookup_id_cards (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    hashed_card_id character varying
);


--
-- Name: idea_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idea_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    idea_id uuid,
    file character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    name character varying
);


--
-- Name: idea_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idea_images (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    idea_id uuid,
    image character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: idea_import_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idea_import_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_id uuid,
    file character varying,
    name character varying,
    import_type character varying,
    num_pages integer DEFAULT 0,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    parent_id uuid
);


--
-- Name: idea_imports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idea_imports (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    idea_id uuid,
    import_user_id uuid,
    file_id uuid,
    user_created boolean DEFAULT false,
    required boolean DEFAULT false,
    approved_at timestamp without time zone,
    page_range text[] DEFAULT '{}'::text[],
    locale character varying,
    string character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    user_consent boolean DEFAULT false NOT NULL,
    content_changes jsonb DEFAULT '{}'::jsonb
);


--
-- Name: idea_trending_infos; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.idea_trending_infos AS
 SELECT ideas.id AS idea_id,
    GREATEST(comments_at.last_comment_at, likes_at.last_liked_at, ideas.published_at) AS last_activity_at,
    to_timestamp(round((((GREATEST(((comments_at.comments_count)::double precision * comments_at.mean_comment_at), (0)::double precision) + GREATEST(((likes_at.likes_count)::double precision * likes_at.mean_liked_at), (0)::double precision)) + date_part('epoch'::text, ideas.published_at)) / (((GREATEST((comments_at.comments_count)::numeric, 0.0) + GREATEST((likes_at.likes_count)::numeric, 0.0)) + 1.0))::double precision))) AS mean_activity_at
   FROM ((public.ideas
     FULL JOIN ( SELECT comments.idea_id,
            max(comments.created_at) AS last_comment_at,
            avg(date_part('epoch'::text, comments.created_at)) AS mean_comment_at,
            count(comments.idea_id) AS comments_count
           FROM public.comments
          GROUP BY comments.idea_id) comments_at ON ((ideas.id = comments_at.idea_id)))
     FULL JOIN ( SELECT reactions.reactable_id,
            max(reactions.created_at) AS last_liked_at,
            avg(date_part('epoch'::text, reactions.created_at)) AS mean_liked_at,
            count(reactions.reactable_id) AS likes_count
           FROM public.reactions
          WHERE (((reactions.mode)::text = 'up'::text) AND ((reactions.reactable_type)::text = 'Idea'::text))
          GROUP BY reactions.reactable_id) likes_at ON ((ideas.id = likes_at.reactable_id)));


--
-- Name: ideas_phases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ideas_phases (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    idea_id uuid,
    phase_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    baskets_count integer DEFAULT 0 NOT NULL,
    votes_count integer DEFAULT 0 NOT NULL
);


--
-- Name: ideas_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ideas_topics (
    idea_id uuid,
    topic_id uuid,
    id uuid DEFAULT shared_extensions.uuid_generate_v4() NOT NULL
);


--
-- Name: identities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.identities (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    provider character varying,
    uid character varying,
    auth_hash jsonb DEFAULT '{}'::jsonb,
    user_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: impact_tracking_pageviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.impact_tracking_pageviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    path character varying NOT NULL,
    project_id uuid,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: impact_tracking_salts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.impact_tracking_salts (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    salt character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: internal_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.internal_comments (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    author_id uuid,
    idea_id uuid,
    parent_id uuid,
    lft integer NOT NULL,
    rgt integer NOT NULL,
    body text NOT NULL,
    publication_status character varying DEFAULT 'published'::character varying NOT NULL,
    body_updated_at timestamp without time zone,
    children_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: machine_translations_machine_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.machine_translations_machine_translations (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    translatable_id uuid NOT NULL,
    translatable_type character varying NOT NULL,
    attribute_name character varying NOT NULL,
    locale_to character varying NOT NULL,
    translation character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: maps_layers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maps_layers (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    map_config_id uuid NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    ordering integer NOT NULL,
    geojson jsonb DEFAULT '{}'::jsonb NOT NULL,
    default_enabled boolean DEFAULT true NOT NULL,
    marker_svg_url character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    type character varying,
    layer_url character varying
);


--
-- Name: maps_map_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maps_map_configs (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    center shared_extensions.geography(Point,4326),
    zoom_level numeric(4,2),
    tile_provider character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    esri_web_map_id character varying,
    esri_base_map_id character varying,
    mappable_type character varying,
    mappable_id uuid
);


--
-- Name: memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memberships (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    group_id uuid,
    user_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: moderation_moderation_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.moderation_moderation_statuses (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    moderatable_id uuid,
    moderatable_type character varying,
    status character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: moderation_moderations; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.moderation_moderations AS
 SELECT ideas.id,
    'Idea'::text AS moderatable_type,
    NULL::text AS post_type,
    NULL::uuid AS post_id,
    NULL::character varying AS post_slug,
    NULL::jsonb AS post_title_multiloc,
    projects.id AS project_id,
    projects.slug AS project_slug,
    projects.title_multiloc AS project_title_multiloc,
    ideas.title_multiloc AS content_title_multiloc,
    ideas.body_multiloc AS content_body_multiloc,
    ideas.slug AS content_slug,
    ideas.published_at AS created_at,
    moderation_moderation_statuses.status AS moderation_status
   FROM ((public.ideas
     LEFT JOIN public.moderation_moderation_statuses ON ((moderation_moderation_statuses.moderatable_id = ideas.id)))
     LEFT JOIN public.projects ON ((projects.id = ideas.project_id)))
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
   FROM (((public.comments
     LEFT JOIN public.moderation_moderation_statuses ON ((moderation_moderation_statuses.moderatable_id = comments.id)))
     LEFT JOIN public.ideas ON ((ideas.id = comments.idea_id)))
     LEFT JOIN public.projects ON ((projects.id = ideas.project_id)));


--
-- Name: nav_bar_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nav_bar_items (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    code character varying NOT NULL,
    ordering integer,
    title_multiloc jsonb,
    static_page_id uuid,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    project_id uuid
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    type character varying,
    read_at timestamp without time zone,
    recipient_id uuid,
    idea_id uuid,
    comment_id uuid,
    project_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    initiating_user_id uuid,
    spam_report_id uuid,
    invite_id uuid,
    reason_code character varying,
    other_reason character varying,
    idea_status_id uuid,
    official_feedback_id uuid,
    phase_id uuid,
    project_folder_id uuid,
    inappropriate_content_flag_id uuid,
    internal_comment_id uuid,
    basket_id uuid,
    cosponsorship_id uuid,
    project_review_id uuid
);


--
-- Name: onboarding_campaign_dismissals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_campaign_dismissals (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    user_id uuid,
    campaign_name character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    action character varying NOT NULL,
    permitted_by character varying NOT NULL,
    permission_scope_id uuid,
    permission_scope_type character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    global_custom_fields boolean DEFAULT false NOT NULL,
    verification_expiry integer,
    access_denied_explanation_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    everyone_tracking_enabled boolean DEFAULT false NOT NULL
);


--
-- Name: permissions_custom_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions_custom_fields (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    permission_id uuid NOT NULL,
    custom_field_id uuid NOT NULL,
    required boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    ordering integer DEFAULT 0
);


--
-- Name: phase_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.phase_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    phase_id uuid,
    file character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    name character varying
);


--
-- Name: polls_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.polls_options (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    question_id uuid,
    title_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: polls_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.polls_questions (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    phase_id uuid NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    question_type character varying DEFAULT 'single_option'::character varying NOT NULL,
    max_options integer
);


--
-- Name: polls_response_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.polls_response_options (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    response_id uuid,
    option_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: project_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_id uuid,
    file character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    name character varying
);


--
-- Name: project_folders_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_folders_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_folder_id uuid,
    file character varying,
    name character varying,
    ordering integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: project_folders_folders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_folders_folders (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb,
    description_multiloc jsonb,
    description_preview_multiloc jsonb,
    header_bg character varying,
    slug character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    followers_count integer DEFAULT 0 NOT NULL,
    header_bg_alt_text_multiloc jsonb DEFAULT '{}'::jsonb
);


--
-- Name: project_folders_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_folders_images (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_folder_id uuid,
    image character varying,
    ordering integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    alt_text_multiloc jsonb DEFAULT '{}'::jsonb
);


--
-- Name: project_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_images (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_id uuid,
    image character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    alt_text_multiloc jsonb DEFAULT '{}'::jsonb
);


--
-- Name: project_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    requester_id uuid,
    reviewer_id uuid,
    approved_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: projects_allowed_input_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects_allowed_input_topics (
    project_id uuid,
    topic_id uuid,
    id uuid DEFAULT shared_extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    ordering integer
);


--
-- Name: projects_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects_topics (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    topic_id uuid NOT NULL,
    project_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: public_api_api_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.public_api_api_clients (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    name character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    last_used_at timestamp(6) without time zone,
    secret_digest character varying NOT NULL,
    secret_postfix character varying NOT NULL
);


--
-- Name: que_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.que_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: que_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.que_jobs_id_seq OWNED BY public.que_jobs.id;


--
-- Name: que_lockers; Type: TABLE; Schema: public; Owner: -
--

CREATE UNLOGGED TABLE public.que_lockers (
    pid integer NOT NULL,
    worker_count integer NOT NULL,
    worker_priorities integer[] NOT NULL,
    ruby_pid integer NOT NULL,
    ruby_hostname text NOT NULL,
    queues text[] NOT NULL,
    listening boolean NOT NULL,
    job_schema_version integer DEFAULT 1,
    CONSTRAINT valid_queues CHECK (((array_ndims(queues) = 1) AND (array_length(queues, 1) IS NOT NULL))),
    CONSTRAINT valid_worker_priorities CHECK (((array_ndims(worker_priorities) = 1) AND (array_length(worker_priorities, 1) IS NOT NULL)))
);


--
-- Name: que_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.que_values (
    key text NOT NULL,
    value jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT valid_value CHECK ((jsonb_typeof(value) = 'object'::text))
)
WITH (fillfactor='90');


--
-- Name: report_builder_published_graph_data_units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_builder_published_graph_data_units (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    report_id uuid NOT NULL,
    graph_id character varying NOT NULL,
    data jsonb NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: report_builder_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_builder_reports (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    name character varying,
    owner_id uuid,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    phase_id uuid,
    visible boolean DEFAULT false NOT NULL,
    name_tsvector tsvector GENERATED ALWAYS AS (to_tsvector('simple'::regconfig, (name)::text)) STORED,
    year integer,
    quarter integer
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: spam_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spam_reports (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    spam_reportable_id uuid NOT NULL,
    spam_reportable_type character varying NOT NULL,
    reported_at timestamp without time zone NOT NULL,
    reason_code character varying,
    other_reason character varying,
    user_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: static_page_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.static_page_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    static_page_id uuid,
    file character varying,
    ordering integer,
    name character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: static_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.static_pages (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    slug character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    code character varying NOT NULL,
    top_info_section_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    banner_enabled boolean DEFAULT false NOT NULL,
    banner_layout character varying DEFAULT 'full_width_banner_layout'::character varying NOT NULL,
    banner_overlay_color character varying,
    banner_overlay_opacity integer,
    banner_cta_button_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    banner_cta_button_type character varying DEFAULT 'no_button'::character varying NOT NULL,
    banner_cta_button_url character varying,
    banner_header_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    banner_subheader_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    top_info_section_enabled boolean DEFAULT false NOT NULL,
    files_section_enabled boolean DEFAULT false NOT NULL,
    projects_enabled boolean DEFAULT false NOT NULL,
    projects_filter_type character varying DEFAULT 'no_filter'::character varying NOT NULL,
    events_widget_enabled boolean DEFAULT false NOT NULL,
    bottom_info_section_enabled boolean DEFAULT false NOT NULL,
    bottom_info_section_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    header_bg character varying
);


--
-- Name: static_pages_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.static_pages_topics (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    topic_id uuid NOT NULL,
    static_page_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: surveys_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.surveys_responses (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    phase_id uuid NOT NULL,
    survey_service character varying NOT NULL,
    external_survey_id character varying NOT NULL,
    external_response_id character varying NOT NULL,
    user_id uuid,
    started_at timestamp without time zone,
    submitted_at timestamp without time zone NOT NULL,
    answers jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    name character varying,
    host character varying,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    logo character varying,
    favicon character varying,
    style jsonb DEFAULT '{}'::jsonb,
    deleted_at timestamp without time zone,
    creation_finalized_at timestamp without time zone
);


--
-- Name: text_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.text_images (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    imageable_type character varying NOT NULL,
    imageable_id uuid NOT NULL,
    imageable_field character varying,
    image character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    text_reference character varying NOT NULL
);


--
-- Name: topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topics (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    icon character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    ordering integer,
    code character varying DEFAULT 'custom'::character varying NOT NULL,
    followers_count integer DEFAULT 0 NOT NULL,
    include_in_onboarding boolean DEFAULT false NOT NULL
);


--
-- Name: user_custom_fields_representativeness_ref_distributions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_custom_fields_representativeness_ref_distributions (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    custom_field_id uuid NOT NULL,
    distribution jsonb NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    type character varying
);


--
-- Name: verification_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_verifications (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    user_id uuid,
    method_name character varying NOT NULL,
    hashed_uid character varying NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: areas_static_pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_static_pages ALTER COLUMN id SET DEFAULT nextval('public.areas_static_pages_id_seq'::regclass);


--
-- Name: que_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.que_jobs ALTER COLUMN id SET DEFAULT nextval('public.que_jobs_id_seq'::regclass);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: admin_publications admin_publications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_publications
    ADD CONSTRAINT admin_publications_pkey PRIMARY KEY (id);


--
-- Name: analysis_additional_custom_fields analysis_analyses_custom_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_additional_custom_fields
    ADD CONSTRAINT analysis_analyses_custom_fields_pkey PRIMARY KEY (id);


--
-- Name: analysis_analyses analysis_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_analyses
    ADD CONSTRAINT analysis_analyses_pkey PRIMARY KEY (id);


--
-- Name: analysis_background_tasks analysis_background_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_background_tasks
    ADD CONSTRAINT analysis_background_tasks_pkey PRIMARY KEY (id);


--
-- Name: analysis_comments_summaries analysis_comments_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_comments_summaries
    ADD CONSTRAINT analysis_comments_summaries_pkey PRIMARY KEY (id);


--
-- Name: analysis_heatmap_cells analysis_heatmap_cells_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_heatmap_cells
    ADD CONSTRAINT analysis_heatmap_cells_pkey PRIMARY KEY (id);


--
-- Name: analysis_insights analysis_insights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_insights
    ADD CONSTRAINT analysis_insights_pkey PRIMARY KEY (id);


--
-- Name: analysis_questions analysis_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_questions
    ADD CONSTRAINT analysis_questions_pkey PRIMARY KEY (id);


--
-- Name: analysis_summaries analysis_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_summaries
    ADD CONSTRAINT analysis_summaries_pkey PRIMARY KEY (id);


--
-- Name: analysis_taggings analysis_taggings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_taggings
    ADD CONSTRAINT analysis_taggings_pkey PRIMARY KEY (id);


--
-- Name: analysis_tags analysis_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_tags
    ADD CONSTRAINT analysis_tags_pkey PRIMARY KEY (id);


--
-- Name: analytics_dimension_dates analytics_dimension_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_dimension_dates
    ADD CONSTRAINT analytics_dimension_dates_pkey PRIMARY KEY (date);


--
-- Name: analytics_dimension_locales analytics_dimension_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_dimension_locales
    ADD CONSTRAINT analytics_dimension_locales_pkey PRIMARY KEY (id);


--
-- Name: analytics_dimension_referrer_types analytics_dimension_referrer_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_dimension_referrer_types
    ADD CONSTRAINT analytics_dimension_referrer_types_pkey PRIMARY KEY (id);


--
-- Name: analytics_dimension_types analytics_dimension_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_dimension_types
    ADD CONSTRAINT analytics_dimension_types_pkey PRIMARY KEY (id);


--
-- Name: analytics_fact_visits analytics_fact_visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_fact_visits
    ADD CONSTRAINT analytics_fact_visits_pkey PRIMARY KEY (id);


--
-- Name: app_configurations app_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_configurations
    ADD CONSTRAINT app_configurations_pkey PRIMARY KEY (id);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- Name: areas_projects areas_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_projects
    ADD CONSTRAINT areas_projects_pkey PRIMARY KEY (id);


--
-- Name: areas_static_pages areas_static_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_static_pages
    ADD CONSTRAINT areas_static_pages_pkey PRIMARY KEY (id);


--
-- Name: authoring_assistance_responses authoring_assistance_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authoring_assistance_responses
    ADD CONSTRAINT authoring_assistance_responses_pkey PRIMARY KEY (id);


--
-- Name: baskets_ideas baskets_ideas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baskets_ideas
    ADD CONSTRAINT baskets_ideas_pkey PRIMARY KEY (id);


--
-- Name: baskets baskets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baskets
    ADD CONSTRAINT baskets_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: common_passwords common_passwords_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.common_passwords
    ADD CONSTRAINT common_passwords_pkey PRIMARY KEY (id);


--
-- Name: content_builder_layout_images content_builder_layout_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_builder_layout_images
    ADD CONSTRAINT content_builder_layout_images_pkey PRIMARY KEY (id);


--
-- Name: content_builder_layouts content_builder_layouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_builder_layouts
    ADD CONSTRAINT content_builder_layouts_pkey PRIMARY KEY (id);


--
-- Name: cosponsorships cosponsorships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cosponsorships
    ADD CONSTRAINT cosponsorships_pkey PRIMARY KEY (id);


--
-- Name: custom_field_bins custom_field_bins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_field_bins
    ADD CONSTRAINT custom_field_bins_pkey PRIMARY KEY (id);


--
-- Name: custom_field_matrix_statements custom_field_matrix_statements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_field_matrix_statements
    ADD CONSTRAINT custom_field_matrix_statements_pkey PRIMARY KEY (id);


--
-- Name: custom_field_option_images custom_field_option_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_field_option_images
    ADD CONSTRAINT custom_field_option_images_pkey PRIMARY KEY (id);


--
-- Name: custom_field_options custom_field_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_field_options
    ADD CONSTRAINT custom_field_options_pkey PRIMARY KEY (id);


--
-- Name: custom_fields custom_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_fields
    ADD CONSTRAINT custom_fields_pkey PRIMARY KEY (id);


--
-- Name: custom_forms custom_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_forms
    ADD CONSTRAINT custom_forms_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns_campaign_email_commands email_campaigns_campaign_email_commands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_campaign_email_commands
    ADD CONSTRAINT email_campaigns_campaign_email_commands_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns_campaigns_groups email_campaigns_campaigns_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_campaigns_groups
    ADD CONSTRAINT email_campaigns_campaigns_groups_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns_campaigns email_campaigns_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_campaigns
    ADD CONSTRAINT email_campaigns_campaigns_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns_consents email_campaigns_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_consents
    ADD CONSTRAINT email_campaigns_consents_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns_deliveries email_campaigns_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_deliveries
    ADD CONSTRAINT email_campaigns_deliveries_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns_examples email_campaigns_examples_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_examples
    ADD CONSTRAINT email_campaigns_examples_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns_unsubscription_tokens email_campaigns_unsubscription_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_unsubscription_tokens
    ADD CONSTRAINT email_campaigns_unsubscription_tokens_pkey PRIMARY KEY (id);


--
-- Name: email_snippets email_snippets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_snippets
    ADD CONSTRAINT email_snippets_pkey PRIMARY KEY (id);


--
-- Name: embeddings_similarities embeddings_similarities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.embeddings_similarities
    ADD CONSTRAINT embeddings_similarities_pkey PRIMARY KEY (id);


--
-- Name: event_files event_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_files
    ADD CONSTRAINT event_files_pkey PRIMARY KEY (id);


--
-- Name: event_images event_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_images
    ADD CONSTRAINT event_images_pkey PRIMARY KEY (id);


--
-- Name: events_attendances events_attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_attendances
    ADD CONSTRAINT events_attendances_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: experiments experiments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT experiments_pkey PRIMARY KEY (id);


--
-- Name: flag_inappropriate_content_inappropriate_content_flags flag_inappropriate_content_inappropriate_content_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flag_inappropriate_content_inappropriate_content_flags
    ADD CONSTRAINT flag_inappropriate_content_inappropriate_content_flags_pkey PRIMARY KEY (id);


--
-- Name: followers followers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.followers
    ADD CONSTRAINT followers_pkey PRIMARY KEY (id);


--
-- Name: groups_permissions groups_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups_permissions
    ADD CONSTRAINT groups_permissions_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: groups_projects groups_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups_projects
    ADD CONSTRAINT groups_projects_pkey PRIMARY KEY (id);


--
-- Name: idea_files idea_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_files
    ADD CONSTRAINT idea_files_pkey PRIMARY KEY (id);


--
-- Name: idea_images idea_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_images
    ADD CONSTRAINT idea_images_pkey PRIMARY KEY (id);


--
-- Name: idea_import_files idea_import_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_import_files
    ADD CONSTRAINT idea_import_files_pkey PRIMARY KEY (id);


--
-- Name: idea_imports idea_imports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_imports
    ADD CONSTRAINT idea_imports_pkey PRIMARY KEY (id);


--
-- Name: idea_statuses idea_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_statuses
    ADD CONSTRAINT idea_statuses_pkey PRIMARY KEY (id);


--
-- Name: ideas_phases ideas_phases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas_phases
    ADD CONSTRAINT ideas_phases_pkey PRIMARY KEY (id);


--
-- Name: ideas ideas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT ideas_pkey PRIMARY KEY (id);


--
-- Name: ideas_topics ideas_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas_topics
    ADD CONSTRAINT ideas_topics_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: impact_tracking_pageviews impact_tracking_pageviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.impact_tracking_pageviews
    ADD CONSTRAINT impact_tracking_pageviews_pkey PRIMARY KEY (id);


--
-- Name: impact_tracking_salts impact_tracking_salts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.impact_tracking_salts
    ADD CONSTRAINT impact_tracking_salts_pkey PRIMARY KEY (id);


--
-- Name: impact_tracking_sessions impact_tracking_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.impact_tracking_sessions
    ADD CONSTRAINT impact_tracking_sessions_pkey PRIMARY KEY (id);


--
-- Name: internal_comments internal_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internal_comments
    ADD CONSTRAINT internal_comments_pkey PRIMARY KEY (id);


--
-- Name: invites invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT invites_pkey PRIMARY KEY (id);


--
-- Name: machine_translations_machine_translations machine_translations_machine_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.machine_translations_machine_translations
    ADD CONSTRAINT machine_translations_machine_translations_pkey PRIMARY KEY (id);


--
-- Name: maps_layers maps_layers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps_layers
    ADD CONSTRAINT maps_layers_pkey PRIMARY KEY (id);


--
-- Name: maps_map_configs maps_map_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps_map_configs
    ADD CONSTRAINT maps_map_configs_pkey PRIMARY KEY (id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: moderation_moderation_statuses moderation_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderation_moderation_statuses
    ADD CONSTRAINT moderation_statuses_pkey PRIMARY KEY (id);


--
-- Name: nav_bar_items nav_bar_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nav_bar_items
    ADD CONSTRAINT nav_bar_items_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: official_feedbacks official_feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_feedbacks
    ADD CONSTRAINT official_feedbacks_pkey PRIMARY KEY (id);


--
-- Name: onboarding_campaign_dismissals onboarding_campaign_dismissals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_campaign_dismissals
    ADD CONSTRAINT onboarding_campaign_dismissals_pkey PRIMARY KEY (id);


--
-- Name: static_page_files page_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.static_page_files
    ADD CONSTRAINT page_files_pkey PRIMARY KEY (id);


--
-- Name: static_pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.static_pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: permissions_custom_fields permissions_custom_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions_custom_fields
    ADD CONSTRAINT permissions_custom_fields_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: phase_files phase_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phase_files
    ADD CONSTRAINT phase_files_pkey PRIMARY KEY (id);


--
-- Name: phases phases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT phases_pkey PRIMARY KEY (id);


--
-- Name: phases phases_start_before_end; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.phases
    ADD CONSTRAINT phases_start_before_end CHECK (((start_at IS NULL) OR (end_at IS NULL) OR (start_at <= end_at))) NOT VALID;


--
-- Name: polls_options polls_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_options
    ADD CONSTRAINT polls_options_pkey PRIMARY KEY (id);


--
-- Name: polls_questions polls_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_questions
    ADD CONSTRAINT polls_questions_pkey PRIMARY KEY (id);


--
-- Name: polls_response_options polls_response_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_response_options
    ADD CONSTRAINT polls_response_options_pkey PRIMARY KEY (id);


--
-- Name: polls_responses polls_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_responses
    ADD CONSTRAINT polls_responses_pkey PRIMARY KEY (id);


--
-- Name: project_files project_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_files
    ADD CONSTRAINT project_files_pkey PRIMARY KEY (id);


--
-- Name: project_folders_files project_folder_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_folders_files
    ADD CONSTRAINT project_folder_files_pkey PRIMARY KEY (id);


--
-- Name: project_folders_images project_folder_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_folders_images
    ADD CONSTRAINT project_folder_images_pkey PRIMARY KEY (id);


--
-- Name: project_folders_folders project_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_folders_folders
    ADD CONSTRAINT project_folders_pkey PRIMARY KEY (id);


--
-- Name: project_images project_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_images
    ADD CONSTRAINT project_images_pkey PRIMARY KEY (id);


--
-- Name: project_reviews project_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_reviews
    ADD CONSTRAINT project_reviews_pkey PRIMARY KEY (id);


--
-- Name: projects_allowed_input_topics projects_allowed_input_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_allowed_input_topics
    ADD CONSTRAINT projects_allowed_input_topics_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: projects_topics projects_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_topics
    ADD CONSTRAINT projects_topics_pkey PRIMARY KEY (id);


--
-- Name: public_api_api_clients public_api_api_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_api_api_clients
    ADD CONSTRAINT public_api_api_clients_pkey PRIMARY KEY (id);


--
-- Name: que_jobs que_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.que_jobs
    ADD CONSTRAINT que_jobs_pkey PRIMARY KEY (id);


--
-- Name: que_lockers que_lockers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.que_lockers
    ADD CONSTRAINT que_lockers_pkey PRIMARY KEY (pid);


--
-- Name: que_values que_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.que_values
    ADD CONSTRAINT que_values_pkey PRIMARY KEY (key);


--
-- Name: report_builder_published_graph_data_units report_builder_published_graph_data_units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_builder_published_graph_data_units
    ADD CONSTRAINT report_builder_published_graph_data_units_pkey PRIMARY KEY (id);


--
-- Name: report_builder_reports report_builder_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_builder_reports
    ADD CONSTRAINT report_builder_reports_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: spam_reports spam_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spam_reports
    ADD CONSTRAINT spam_reports_pkey PRIMARY KEY (id);


--
-- Name: static_pages_topics static_pages_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.static_pages_topics
    ADD CONSTRAINT static_pages_topics_pkey PRIMARY KEY (id);


--
-- Name: surveys_responses surveys_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.surveys_responses
    ADD CONSTRAINT surveys_responses_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: text_images text_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.text_images
    ADD CONSTRAINT text_images_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: user_custom_fields_representativeness_ref_distributions user_custom_fields_representativeness_ref_distributions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_custom_fields_representativeness_ref_distributions
    ADD CONSTRAINT user_custom_fields_representativeness_ref_distributions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: id_id_card_lookup_id_cards verification_id_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.id_id_card_lookup_id_cards
    ADD CONSTRAINT verification_id_cards_pkey PRIMARY KEY (id);


--
-- Name: verification_verifications verification_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_verifications
    ADD CONSTRAINT verification_verifications_pkey PRIMARY KEY (id);


--
-- Name: volunteering_causes volunteering_causes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteering_causes
    ADD CONSTRAINT volunteering_causes_pkey PRIMARY KEY (id);


--
-- Name: volunteering_volunteers volunteering_volunteers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteering_volunteers
    ADD CONSTRAINT volunteering_volunteers_pkey PRIMARY KEY (id);


--
-- Name: reactions votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- Name: i_analytics_dim_locales_fact_visits_on_locale_and_visit_ids; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX i_analytics_dim_locales_fact_visits_on_locale_and_visit_ids ON public.analytics_dimension_locales_fact_visits USING btree (dimension_locale_id, fact_visit_id);


--
-- Name: i_analytics_dim_projects_fact_visits_on_project_and_visit_ids; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX i_analytics_dim_projects_fact_visits_on_project_and_visit_ids ON public.analytics_dimension_projects_fact_visits USING btree (dimension_project_id, fact_visit_id);


--
-- Name: i_d_referrer_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX i_d_referrer_key ON public.analytics_dimension_referrer_types USING btree (key);


--
-- Name: i_l_v_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX i_l_v_locale ON public.analytics_dimension_locales_fact_visits USING btree (dimension_locale_id);


--
-- Name: i_l_v_visit; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX i_l_v_visit ON public.analytics_dimension_locales_fact_visits USING btree (fact_visit_id);


--
-- Name: i_p_v_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX i_p_v_project ON public.analytics_dimension_projects_fact_visits USING btree (dimension_project_id);


--
-- Name: i_p_v_visit; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX i_p_v_visit ON public.analytics_dimension_projects_fact_visits USING btree (fact_visit_id);


--
-- Name: i_v_first_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX i_v_first_action ON public.analytics_fact_visits USING btree (dimension_date_first_action_id);


--
-- Name: i_v_last_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX i_v_last_action ON public.analytics_fact_visits USING btree (dimension_date_last_action_id);


--
-- Name: i_v_matomo_visit; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX i_v_matomo_visit ON public.analytics_fact_visits USING btree (matomo_visit_id);


--
-- Name: i_v_referrer_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX i_v_referrer_type ON public.analytics_fact_visits USING btree (dimension_referrer_type_id);


--
-- Name: i_v_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX i_v_timestamp ON public.analytics_fact_visits USING btree (matomo_last_action_time);


--
-- Name: i_v_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX i_v_user ON public.analytics_fact_visits USING btree (dimension_user_id);


--
-- Name: inappropriate_content_flags_flaggable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inappropriate_content_flags_flaggable ON public.flag_inappropriate_content_inappropriate_content_flags USING btree (flaggable_id, flaggable_type);


--
-- Name: index_activities_on_acted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_activities_on_acted_at ON public.activities USING btree (acted_at);


--
-- Name: index_activities_on_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_activities_on_action ON public.activities USING btree (action);


--
-- Name: index_activities_on_item_type_and_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_activities_on_item_type_and_item_id ON public.activities USING btree (item_type, item_id);


--
-- Name: index_activities_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_activities_on_project_id ON public.activities USING btree (project_id);


--
-- Name: index_activities_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_activities_on_user_id ON public.activities USING btree (user_id);


--
-- Name: index_admin_publications_on_depth; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_publications_on_depth ON public.admin_publications USING btree (depth);


--
-- Name: index_admin_publications_on_lft; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_publications_on_lft ON public.admin_publications USING btree (lft);


--
-- Name: index_admin_publications_on_ordering; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_publications_on_ordering ON public.admin_publications USING btree (ordering);


--
-- Name: index_admin_publications_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_publications_on_parent_id ON public.admin_publications USING btree (parent_id);


--
-- Name: index_admin_publications_on_publication_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_publications_on_publication_status ON public.admin_publications USING btree (publication_status);


--
-- Name: index_admin_publications_on_publication_type_and_publication_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_publications_on_publication_type_and_publication_id ON public.admin_publications USING btree (publication_type, publication_id);


--
-- Name: index_admin_publications_on_rgt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_publications_on_rgt ON public.admin_publications USING btree (rgt);


--
-- Name: index_analysis_additional_custom_fields_on_analysis_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_additional_custom_fields_on_analysis_id ON public.analysis_additional_custom_fields USING btree (analysis_id);


--
-- Name: index_analysis_additional_custom_fields_on_custom_field_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_additional_custom_fields_on_custom_field_id ON public.analysis_additional_custom_fields USING btree (custom_field_id);


--
-- Name: index_analysis_analyses_custom_fields; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_analysis_analyses_custom_fields ON public.analysis_additional_custom_fields USING btree (analysis_id, custom_field_id);


--
-- Name: index_analysis_analyses_on_main_custom_field_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_analyses_on_main_custom_field_id ON public.analysis_analyses USING btree (main_custom_field_id);


--
-- Name: index_analysis_analyses_on_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_analyses_on_phase_id ON public.analysis_analyses USING btree (phase_id);


--
-- Name: index_analysis_analyses_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_analyses_on_project_id ON public.analysis_analyses USING btree (project_id);


--
-- Name: index_analysis_background_tasks_on_analysis_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_background_tasks_on_analysis_id ON public.analysis_background_tasks USING btree (analysis_id);


--
-- Name: index_analysis_comments_summaries_on_background_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_comments_summaries_on_background_task_id ON public.analysis_comments_summaries USING btree (background_task_id);


--
-- Name: index_analysis_comments_summaries_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_comments_summaries_on_idea_id ON public.analysis_comments_summaries USING btree (idea_id);


--
-- Name: index_analysis_heatmap_cells_on_analysis_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_heatmap_cells_on_analysis_id ON public.analysis_heatmap_cells USING btree (analysis_id);


--
-- Name: index_analysis_heatmap_cells_on_column; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_heatmap_cells_on_column ON public.analysis_heatmap_cells USING btree (column_type, column_id);


--
-- Name: index_analysis_heatmap_cells_on_row; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_heatmap_cells_on_row ON public.analysis_heatmap_cells USING btree (row_type, row_id);


--
-- Name: index_analysis_heatmap_cells_uniqueness; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_analysis_heatmap_cells_uniqueness ON public.analysis_heatmap_cells USING btree (analysis_id, row_id, column_id, unit);


--
-- Name: index_analysis_insights_on_analysis_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_insights_on_analysis_id ON public.analysis_insights USING btree (analysis_id);


--
-- Name: index_analysis_insights_on_insightable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_insights_on_insightable ON public.analysis_insights USING btree (insightable_type, insightable_id);


--
-- Name: index_analysis_questions_on_background_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_questions_on_background_task_id ON public.analysis_questions USING btree (background_task_id);


--
-- Name: index_analysis_summaries_on_background_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_summaries_on_background_task_id ON public.analysis_summaries USING btree (background_task_id);


--
-- Name: index_analysis_taggings_on_input_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_taggings_on_input_id ON public.analysis_taggings USING btree (input_id);


--
-- Name: index_analysis_taggings_on_tag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_taggings_on_tag_id ON public.analysis_taggings USING btree (tag_id);


--
-- Name: index_analysis_taggings_on_tag_id_and_input_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_analysis_taggings_on_tag_id_and_input_id ON public.analysis_taggings USING btree (tag_id, input_id);


--
-- Name: index_analysis_tags_on_analysis_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_analysis_tags_on_analysis_id ON public.analysis_tags USING btree (analysis_id);


--
-- Name: index_analysis_tags_on_analysis_id_and_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_analysis_tags_on_analysis_id_and_name ON public.analysis_tags USING btree (analysis_id, name);


--
-- Name: index_analytics_dimension_locales_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_analytics_dimension_locales_on_name ON public.analytics_dimension_locales USING btree (name);


--
-- Name: index_analytics_dimension_types_on_name_and_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_analytics_dimension_types_on_name_and_parent ON public.analytics_dimension_types USING btree (name, parent);


--
-- Name: index_areas_on_custom_field_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_areas_on_custom_field_option_id ON public.areas USING btree (custom_field_option_id);


--
-- Name: index_areas_on_include_in_onboarding; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_areas_on_include_in_onboarding ON public.areas USING btree (include_in_onboarding);


--
-- Name: index_areas_projects_on_area_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_areas_projects_on_area_id ON public.areas_projects USING btree (area_id);


--
-- Name: index_areas_projects_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_areas_projects_on_project_id ON public.areas_projects USING btree (project_id);


--
-- Name: index_areas_projects_on_project_id_and_area_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_areas_projects_on_project_id_and_area_id ON public.areas_projects USING btree (project_id, area_id);


--
-- Name: index_areas_static_pages_on_area_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_areas_static_pages_on_area_id ON public.areas_static_pages USING btree (area_id);


--
-- Name: index_areas_static_pages_on_static_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_areas_static_pages_on_static_page_id ON public.areas_static_pages USING btree (static_page_id);


--
-- Name: index_authoring_assistance_responses_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_authoring_assistance_responses_on_idea_id ON public.authoring_assistance_responses USING btree (idea_id);


--
-- Name: index_baskets_ideas_on_basket_id_and_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_baskets_ideas_on_basket_id_and_idea_id ON public.baskets_ideas USING btree (basket_id, idea_id);


--
-- Name: index_baskets_ideas_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_baskets_ideas_on_idea_id ON public.baskets_ideas USING btree (idea_id);


--
-- Name: index_baskets_on_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_baskets_on_phase_id ON public.baskets USING btree (phase_id);


--
-- Name: index_baskets_on_submitted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_baskets_on_submitted_at ON public.baskets USING btree (submitted_at);


--
-- Name: index_baskets_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_baskets_on_user_id ON public.baskets USING btree (user_id);


--
-- Name: index_campaigns_groups; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_campaigns_groups ON public.email_campaigns_campaigns_groups USING btree (campaign_id, group_id);


--
-- Name: index_comments_on_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_author_id ON public.comments USING btree (author_id);


--
-- Name: index_comments_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_created_at ON public.comments USING btree (created_at);


--
-- Name: index_comments_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_idea_id ON public.comments USING btree (idea_id);


--
-- Name: index_comments_on_lft; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_lft ON public.comments USING btree (lft);


--
-- Name: index_comments_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_parent_id ON public.comments USING btree (parent_id);


--
-- Name: index_comments_on_rgt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_rgt ON public.comments USING btree (rgt);


--
-- Name: index_common_passwords_on_password; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_common_passwords_on_password ON public.common_passwords USING btree (password);


--
-- Name: index_content_builder_layouts_content_buidable_type_id_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_content_builder_layouts_content_buidable_type_id_code ON public.content_builder_layouts USING btree (content_buildable_type, content_buildable_id, code);


--
-- Name: index_cosponsorships_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cosponsorships_on_idea_id ON public.cosponsorships USING btree (idea_id);


--
-- Name: index_cosponsorships_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cosponsorships_on_user_id ON public.cosponsorships USING btree (user_id);


--
-- Name: index_custom_field_bins_on_custom_field_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_custom_field_bins_on_custom_field_id ON public.custom_field_bins USING btree (custom_field_id);


--
-- Name: index_custom_field_bins_on_custom_field_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_custom_field_bins_on_custom_field_option_id ON public.custom_field_bins USING btree (custom_field_option_id);


--
-- Name: index_custom_field_matrix_statements_on_custom_field_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_custom_field_matrix_statements_on_custom_field_id ON public.custom_field_matrix_statements USING btree (custom_field_id);


--
-- Name: index_custom_field_matrix_statements_on_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_custom_field_matrix_statements_on_key ON public.custom_field_matrix_statements USING btree (key);


--
-- Name: index_custom_field_option_images_on_custom_field_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_custom_field_option_images_on_custom_field_option_id ON public.custom_field_option_images USING btree (custom_field_option_id);


--
-- Name: index_custom_field_options_on_custom_field_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_custom_field_options_on_custom_field_id ON public.custom_field_options USING btree (custom_field_id);


--
-- Name: index_custom_field_options_on_custom_field_id_and_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_custom_field_options_on_custom_field_id_and_key ON public.custom_field_options USING btree (custom_field_id, key);


--
-- Name: index_custom_fields_on_resource_type_and_resource_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_custom_fields_on_resource_type_and_resource_id ON public.custom_fields USING btree (resource_type, resource_id);


--
-- Name: index_custom_forms_on_participation_context; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_custom_forms_on_participation_context ON public.custom_forms USING btree (participation_context_id, participation_context_type);


--
-- Name: index_dismissals_on_campaign_name_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_dismissals_on_campaign_name_and_user_id ON public.onboarding_campaign_dismissals USING btree (campaign_name, user_id);


--
-- Name: index_email_campaigns_campaign_email_commands_on_recipient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_campaign_email_commands_on_recipient_id ON public.email_campaigns_campaign_email_commands USING btree (recipient_id);


--
-- Name: index_email_campaigns_campaigns_groups_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_campaigns_groups_on_campaign_id ON public.email_campaigns_campaigns_groups USING btree (campaign_id);


--
-- Name: index_email_campaigns_campaigns_groups_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_campaigns_groups_on_group_id ON public.email_campaigns_campaigns_groups USING btree (group_id);


--
-- Name: index_email_campaigns_campaigns_on_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_campaigns_on_author_id ON public.email_campaigns_campaigns USING btree (author_id);


--
-- Name: index_email_campaigns_campaigns_on_context_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_campaigns_on_context_id ON public.email_campaigns_campaigns USING btree (context_id);


--
-- Name: index_email_campaigns_campaigns_on_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_campaigns_on_type ON public.email_campaigns_campaigns USING btree (type);


--
-- Name: index_email_campaigns_consents_on_campaign_type_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_email_campaigns_consents_on_campaign_type_and_user_id ON public.email_campaigns_consents USING btree (campaign_type, user_id);


--
-- Name: index_email_campaigns_consents_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_consents_on_user_id ON public.email_campaigns_consents USING btree (user_id);


--
-- Name: index_email_campaigns_deliveries_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_deliveries_on_campaign_id ON public.email_campaigns_deliveries USING btree (campaign_id);


--
-- Name: index_email_campaigns_deliveries_on_campaign_id_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_deliveries_on_campaign_id_and_user_id ON public.email_campaigns_deliveries USING btree (campaign_id, user_id);


--
-- Name: index_email_campaigns_deliveries_on_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_deliveries_on_sent_at ON public.email_campaigns_deliveries USING btree (sent_at);


--
-- Name: index_email_campaigns_deliveries_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_deliveries_on_user_id ON public.email_campaigns_deliveries USING btree (user_id);


--
-- Name: index_email_campaigns_examples_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_examples_on_campaign_id ON public.email_campaigns_examples USING btree (campaign_id);


--
-- Name: index_email_campaigns_examples_on_recipient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_examples_on_recipient_id ON public.email_campaigns_examples USING btree (recipient_id);


--
-- Name: index_email_campaigns_unsubscription_tokens_on_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_unsubscription_tokens_on_token ON public.email_campaigns_unsubscription_tokens USING btree (token);


--
-- Name: index_email_campaigns_unsubscription_tokens_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_unsubscription_tokens_on_user_id ON public.email_campaigns_unsubscription_tokens USING btree (user_id);


--
-- Name: index_email_snippets_on_email_and_snippet_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_snippets_on_email_and_snippet_and_locale ON public.email_snippets USING btree (email, snippet, locale);


--
-- Name: index_embeddings_similarities_on_embeddable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_embeddings_similarities_on_embeddable ON public.embeddings_similarities USING btree (embeddable_type, embeddable_id);


--
-- Name: index_embeddings_similarities_on_embedded_attributes; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_embeddings_similarities_on_embedded_attributes ON public.embeddings_similarities USING btree (embedded_attributes);


--
-- Name: index_embeddings_similarities_on_embedding; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_embeddings_similarities_on_embedding ON public.embeddings_similarities USING hnsw (embedding shared_extensions.vector_cosine_ops);


--
-- Name: index_event_files_on_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_event_files_on_event_id ON public.event_files USING btree (event_id);


--
-- Name: index_event_images_on_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_event_images_on_event_id ON public.event_images USING btree (event_id);


--
-- Name: index_events_attendances_on_attendee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_attendances_on_attendee_id ON public.events_attendances USING btree (attendee_id);


--
-- Name: index_events_attendances_on_attendee_id_and_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_events_attendances_on_attendee_id_and_event_id ON public.events_attendances USING btree (attendee_id, event_id);


--
-- Name: index_events_attendances_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_attendances_on_created_at ON public.events_attendances USING btree (created_at);


--
-- Name: index_events_attendances_on_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_attendances_on_event_id ON public.events_attendances USING btree (event_id);


--
-- Name: index_events_attendances_on_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_attendances_on_updated_at ON public.events_attendances USING btree (updated_at);


--
-- Name: index_events_on_location_point; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_on_location_point ON public.events USING gist (location_point);


--
-- Name: index_events_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_on_project_id ON public.events USING btree (project_id);


--
-- Name: index_followers_followable_type_id_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_followers_followable_type_id_user_id ON public.followers USING btree (followable_id, followable_type, user_id);


--
-- Name: index_followers_on_followable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_followers_on_followable ON public.followers USING btree (followable_type, followable_id);


--
-- Name: index_followers_on_followable_id_and_followable_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_followers_on_followable_id_and_followable_type ON public.followers USING btree (followable_id, followable_type);


--
-- Name: index_followers_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_followers_on_user_id ON public.followers USING btree (user_id);


--
-- Name: index_groups_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_groups_on_slug ON public.groups USING btree (slug);


--
-- Name: index_groups_permissions_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_groups_permissions_on_group_id ON public.groups_permissions USING btree (group_id);


--
-- Name: index_groups_permissions_on_permission_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_groups_permissions_on_permission_id ON public.groups_permissions USING btree (permission_id);


--
-- Name: index_groups_projects_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_groups_projects_on_group_id ON public.groups_projects USING btree (group_id);


--
-- Name: index_groups_projects_on_group_id_and_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_groups_projects_on_group_id_and_project_id ON public.groups_projects USING btree (group_id, project_id);


--
-- Name: index_groups_projects_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_groups_projects_on_project_id ON public.groups_projects USING btree (project_id);


--
-- Name: index_id_id_card_lookup_id_cards_on_hashed_card_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_id_id_card_lookup_id_cards_on_hashed_card_id ON public.id_id_card_lookup_id_cards USING btree (hashed_card_id);


--
-- Name: index_idea_files_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idea_files_on_idea_id ON public.idea_files USING btree (idea_id);


--
-- Name: index_idea_images_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idea_images_on_idea_id ON public.idea_images USING btree (idea_id);


--
-- Name: index_idea_import_files_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idea_import_files_on_parent_id ON public.idea_import_files USING btree (parent_id);


--
-- Name: index_idea_import_files_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idea_import_files_on_project_id ON public.idea_import_files USING btree (project_id);


--
-- Name: index_idea_imports_on_file_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idea_imports_on_file_id ON public.idea_imports USING btree (file_id);


--
-- Name: index_idea_imports_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idea_imports_on_idea_id ON public.idea_imports USING btree (idea_id);


--
-- Name: index_idea_imports_on_import_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idea_imports_on_import_user_id ON public.idea_imports USING btree (import_user_id);


--
-- Name: index_ideas_on_author_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_on_author_hash ON public.ideas USING btree (author_hash);


--
-- Name: index_ideas_on_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_on_author_id ON public.ideas USING btree (author_id);


--
-- Name: index_ideas_on_body_multiloc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_on_body_multiloc ON public.ideas USING gin (body_multiloc);


--
-- Name: index_ideas_on_idea_status_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_on_idea_status_id ON public.ideas USING btree (idea_status_id);


--
-- Name: index_ideas_on_location_point; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_on_location_point ON public.ideas USING gist (location_point);


--
-- Name: index_ideas_on_manual_votes_last_updated_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_on_manual_votes_last_updated_by_id ON public.ideas USING btree (manual_votes_last_updated_by_id);


--
-- Name: index_ideas_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_on_project_id ON public.ideas USING btree (project_id);


--
-- Name: index_ideas_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_ideas_on_slug ON public.ideas USING btree (slug);


--
-- Name: index_ideas_on_title_multiloc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_on_title_multiloc ON public.ideas USING gin (title_multiloc);


--
-- Name: index_ideas_phases_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_phases_on_idea_id ON public.ideas_phases USING btree (idea_id);


--
-- Name: index_ideas_phases_on_idea_id_and_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_ideas_phases_on_idea_id_and_phase_id ON public.ideas_phases USING btree (idea_id, phase_id);


--
-- Name: index_ideas_phases_on_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_phases_on_phase_id ON public.ideas_phases USING btree (phase_id);


--
-- Name: index_ideas_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_search ON public.ideas USING gin (((to_tsvector('simple'::regconfig, COALESCE((title_multiloc)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((body_multiloc)::text, ''::text)))));


--
-- Name: index_ideas_topics_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_topics_on_idea_id ON public.ideas_topics USING btree (idea_id);


--
-- Name: index_ideas_topics_on_idea_id_and_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_ideas_topics_on_idea_id_and_topic_id ON public.ideas_topics USING btree (idea_id, topic_id);


--
-- Name: index_ideas_topics_on_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_topics_on_topic_id ON public.ideas_topics USING btree (topic_id);


--
-- Name: index_identities_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_identities_on_user_id ON public.identities USING btree (user_id);


--
-- Name: index_impact_tracking_sessions_on_monthly_user_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_impact_tracking_sessions_on_monthly_user_hash ON public.impact_tracking_sessions USING btree (monthly_user_hash);


--
-- Name: index_internal_comments_on_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_internal_comments_on_author_id ON public.internal_comments USING btree (author_id);


--
-- Name: index_internal_comments_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_internal_comments_on_created_at ON public.internal_comments USING btree (created_at);


--
-- Name: index_internal_comments_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_internal_comments_on_idea_id ON public.internal_comments USING btree (idea_id);


--
-- Name: index_internal_comments_on_lft; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_internal_comments_on_lft ON public.internal_comments USING btree (lft);


--
-- Name: index_internal_comments_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_internal_comments_on_parent_id ON public.internal_comments USING btree (parent_id);


--
-- Name: index_internal_comments_on_rgt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_internal_comments_on_rgt ON public.internal_comments USING btree (rgt);


--
-- Name: index_invites_on_invitee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_invites_on_invitee_id ON public.invites USING btree (invitee_id);


--
-- Name: index_invites_on_inviter_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_invites_on_inviter_id ON public.invites USING btree (inviter_id);


--
-- Name: index_invites_on_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_invites_on_token ON public.invites USING btree (token);


--
-- Name: index_maps_layers_on_map_config_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_maps_layers_on_map_config_id ON public.maps_layers USING btree (map_config_id);


--
-- Name: index_maps_map_configs_on_mappable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_maps_map_configs_on_mappable ON public.maps_map_configs USING btree (mappable_type, mappable_id);


--
-- Name: index_maps_map_configs_on_mappable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_maps_map_configs_on_mappable_id ON public.maps_map_configs USING btree (mappable_id);


--
-- Name: index_memberships_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_group_id ON public.memberships USING btree (group_id);


--
-- Name: index_memberships_on_group_id_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_memberships_on_group_id_and_user_id ON public.memberships USING btree (group_id, user_id);


--
-- Name: index_memberships_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_user_id ON public.memberships USING btree (user_id);


--
-- Name: index_nav_bar_items_on_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_nav_bar_items_on_code ON public.nav_bar_items USING btree (code);


--
-- Name: index_nav_bar_items_on_ordering; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_nav_bar_items_on_ordering ON public.nav_bar_items USING btree (ordering);


--
-- Name: index_nav_bar_items_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_nav_bar_items_on_project_id ON public.nav_bar_items USING btree (project_id);


--
-- Name: index_nav_bar_items_on_static_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_nav_bar_items_on_static_page_id ON public.nav_bar_items USING btree (static_page_id);


--
-- Name: index_notifications_on_basket_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_basket_id ON public.notifications USING btree (basket_id);


--
-- Name: index_notifications_on_cosponsorship_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_cosponsorship_id ON public.notifications USING btree (cosponsorship_id);


--
-- Name: index_notifications_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_created_at ON public.notifications USING btree (created_at);


--
-- Name: index_notifications_on_idea_status_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_idea_status_id ON public.notifications USING btree (idea_status_id);


--
-- Name: index_notifications_on_inappropriate_content_flag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_inappropriate_content_flag_id ON public.notifications USING btree (inappropriate_content_flag_id);


--
-- Name: index_notifications_on_initiating_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_initiating_user_id ON public.notifications USING btree (initiating_user_id);


--
-- Name: index_notifications_on_internal_comment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_internal_comment_id ON public.notifications USING btree (internal_comment_id);


--
-- Name: index_notifications_on_invite_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_invite_id ON public.notifications USING btree (invite_id);


--
-- Name: index_notifications_on_official_feedback_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_official_feedback_id ON public.notifications USING btree (official_feedback_id);


--
-- Name: index_notifications_on_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_phase_id ON public.notifications USING btree (phase_id);


--
-- Name: index_notifications_on_project_review_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_project_review_id ON public.notifications USING btree (project_review_id);


--
-- Name: index_notifications_on_recipient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_recipient_id ON public.notifications USING btree (recipient_id);


--
-- Name: index_notifications_on_recipient_id_and_read_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_recipient_id_and_read_at ON public.notifications USING btree (recipient_id, read_at);


--
-- Name: index_notifications_on_spam_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_spam_report_id ON public.notifications USING btree (spam_report_id);


--
-- Name: index_official_feedbacks_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_official_feedbacks_on_idea_id ON public.official_feedbacks USING btree (idea_id);


--
-- Name: index_official_feedbacks_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_official_feedbacks_on_user_id ON public.official_feedbacks USING btree (user_id);


--
-- Name: index_onboarding_campaign_dismissals_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_onboarding_campaign_dismissals_on_user_id ON public.onboarding_campaign_dismissals USING btree (user_id);


--
-- Name: index_permission_field; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_permission_field ON public.permissions_custom_fields USING btree (permission_id, custom_field_id);


--
-- Name: index_permissions_custom_fields_on_custom_field_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_permissions_custom_fields_on_custom_field_id ON public.permissions_custom_fields USING btree (custom_field_id);


--
-- Name: index_permissions_custom_fields_on_permission_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_permissions_custom_fields_on_permission_id ON public.permissions_custom_fields USING btree (permission_id);


--
-- Name: index_permissions_on_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_permissions_on_action ON public.permissions USING btree (action);


--
-- Name: index_permissions_on_permission_scope_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_permissions_on_permission_scope_id ON public.permissions USING btree (permission_scope_id);


--
-- Name: index_phase_files_on_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_phase_files_on_phase_id ON public.phase_files USING btree (phase_id);


--
-- Name: index_phases_on_manual_voters_last_updated_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_phases_on_manual_voters_last_updated_by_id ON public.phases USING btree (manual_voters_last_updated_by_id);


--
-- Name: index_phases_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_phases_on_project_id ON public.phases USING btree (project_id);


--
-- Name: index_phases_on_start_at_and_end_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_phases_on_start_at_and_end_at ON public.phases USING btree (start_at, end_at);


--
-- Name: index_polls_options_on_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_polls_options_on_question_id ON public.polls_options USING btree (question_id);


--
-- Name: index_polls_questions_on_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_polls_questions_on_phase_id ON public.polls_questions USING btree (phase_id);


--
-- Name: index_polls_response_options_on_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_polls_response_options_on_option_id ON public.polls_response_options USING btree (option_id);


--
-- Name: index_polls_response_options_on_response_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_polls_response_options_on_response_id ON public.polls_response_options USING btree (response_id);


--
-- Name: index_polls_responses_on_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_polls_responses_on_phase_id ON public.polls_responses USING btree (phase_id);


--
-- Name: index_polls_responses_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_polls_responses_on_user_id ON public.polls_responses USING btree (user_id);


--
-- Name: index_project_files_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_files_on_project_id ON public.project_files USING btree (project_id);


--
-- Name: index_project_folders_files_on_project_folder_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_folders_files_on_project_folder_id ON public.project_folders_files USING btree (project_folder_id);


--
-- Name: index_project_folders_folders_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_folders_folders_on_slug ON public.project_folders_folders USING btree (slug);


--
-- Name: index_project_folders_images_on_project_folder_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_folders_images_on_project_folder_id ON public.project_folders_images USING btree (project_folder_id);


--
-- Name: index_project_images_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_images_on_project_id ON public.project_images USING btree (project_id);


--
-- Name: index_project_reviews_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_project_reviews_on_project_id ON public.project_reviews USING btree (project_id);


--
-- Name: index_project_reviews_on_requester_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_reviews_on_requester_id ON public.project_reviews USING btree (requester_id);


--
-- Name: index_project_reviews_on_reviewer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_reviews_on_reviewer_id ON public.project_reviews USING btree (reviewer_id);


--
-- Name: index_projects_allowed_input_topics_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_projects_allowed_input_topics_on_project_id ON public.projects_allowed_input_topics USING btree (project_id);


--
-- Name: index_projects_allowed_input_topics_on_topic_id_and_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_projects_allowed_input_topics_on_topic_id_and_project_id ON public.projects_allowed_input_topics USING btree (topic_id, project_id);


--
-- Name: index_projects_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_projects_on_slug ON public.projects USING btree (slug);


--
-- Name: index_projects_topics_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_projects_topics_on_project_id ON public.projects_topics USING btree (project_id);


--
-- Name: index_projects_topics_on_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_projects_topics_on_topic_id ON public.projects_topics USING btree (topic_id);


--
-- Name: index_reactions_on_reactable_type_and_reactable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reactions_on_reactable_type_and_reactable_id ON public.reactions USING btree (reactable_type, reactable_id);


--
-- Name: index_reactions_on_reactable_type_and_reactable_id_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_reactions_on_reactable_type_and_reactable_id_and_user_id ON public.reactions USING btree (reactable_type, reactable_id, user_id);


--
-- Name: index_reactions_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reactions_on_user_id ON public.reactions USING btree (user_id);


--
-- Name: index_report_builder_reports_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_report_builder_reports_on_name ON public.report_builder_reports USING btree (name);


--
-- Name: index_report_builder_reports_on_name_tsvector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_report_builder_reports_on_name_tsvector ON public.report_builder_reports USING gin (name_tsvector);


--
-- Name: index_report_builder_reports_on_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_report_builder_reports_on_owner_id ON public.report_builder_reports USING btree (owner_id);


--
-- Name: index_report_builder_reports_on_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_report_builder_reports_on_phase_id ON public.report_builder_reports USING btree (phase_id);


--
-- Name: index_spam_reports_on_reported_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_spam_reports_on_reported_at ON public.spam_reports USING btree (reported_at);


--
-- Name: index_spam_reports_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_spam_reports_on_user_id ON public.spam_reports USING btree (user_id);


--
-- Name: index_static_page_files_on_static_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_static_page_files_on_static_page_id ON public.static_page_files USING btree (static_page_id);


--
-- Name: index_static_pages_on_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_static_pages_on_code ON public.static_pages USING btree (code);


--
-- Name: index_static_pages_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_static_pages_on_slug ON public.static_pages USING btree (slug);


--
-- Name: index_static_pages_topics_on_static_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_static_pages_topics_on_static_page_id ON public.static_pages_topics USING btree (static_page_id);


--
-- Name: index_static_pages_topics_on_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_static_pages_topics_on_topic_id ON public.static_pages_topics USING btree (topic_id);


--
-- Name: index_surveys_responses_on_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_surveys_responses_on_phase_id ON public.surveys_responses USING btree (phase_id);


--
-- Name: index_surveys_responses_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_surveys_responses_on_user_id ON public.surveys_responses USING btree (user_id);


--
-- Name: index_tenants_on_creation_finalized_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tenants_on_creation_finalized_at ON public.tenants USING btree (creation_finalized_at);


--
-- Name: index_tenants_on_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tenants_on_deleted_at ON public.tenants USING btree (deleted_at);


--
-- Name: index_tenants_on_host; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tenants_on_host ON public.tenants USING btree (host);


--
-- Name: index_topics_on_include_in_onboarding; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_topics_on_include_in_onboarding ON public.topics USING btree (include_in_onboarding);


--
-- Name: index_ucf_representativeness_ref_distributions_on_custom_field; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ucf_representativeness_ref_distributions_on_custom_field ON public.user_custom_fields_representativeness_ref_distributions USING btree (custom_field_id);


--
-- Name: index_users_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_email ON public.users USING btree (email);


--
-- Name: index_users_on_registration_completed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_registration_completed_at ON public.users USING btree (registration_completed_at);


--
-- Name: index_users_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_slug ON public.users USING btree (slug);


--
-- Name: index_users_on_unique_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_unique_code ON public.users USING btree (unique_code);


--
-- Name: index_verification_verifications_on_hashed_uid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_verification_verifications_on_hashed_uid ON public.verification_verifications USING btree (hashed_uid);


--
-- Name: index_verification_verifications_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_verification_verifications_on_user_id ON public.verification_verifications USING btree (user_id);


--
-- Name: index_volunteering_causes_on_ordering; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_volunteering_causes_on_ordering ON public.volunteering_causes USING btree (ordering);


--
-- Name: index_volunteering_causes_on_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_volunteering_causes_on_phase_id ON public.volunteering_causes USING btree (phase_id);


--
-- Name: index_volunteering_volunteers_on_cause_id_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_volunteering_volunteers_on_cause_id_and_user_id ON public.volunteering_volunteers USING btree (cause_id, user_id);


--
-- Name: index_volunteering_volunteers_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_volunteering_volunteers_on_user_id ON public.volunteering_volunteers USING btree (user_id);


--
-- Name: machine_translations_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX machine_translations_lookup ON public.machine_translations_machine_translations USING btree (translatable_id, translatable_type, attribute_name, locale_to);


--
-- Name: machine_translations_translatable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX machine_translations_translatable ON public.machine_translations_machine_translations USING btree (translatable_id, translatable_type);


--
-- Name: moderation_statuses_moderatable; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX moderation_statuses_moderatable ON public.moderation_moderation_statuses USING btree (moderatable_type, moderatable_id);


--
-- Name: que_jobs_args_gin_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX que_jobs_args_gin_idx ON public.que_jobs USING gin (args jsonb_path_ops);


--
-- Name: que_jobs_data_gin_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX que_jobs_data_gin_idx ON public.que_jobs USING gin (data jsonb_path_ops);


--
-- Name: que_jobs_kwargs_gin_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX que_jobs_kwargs_gin_idx ON public.que_jobs USING gin (kwargs jsonb_path_ops);


--
-- Name: que_poll_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX que_poll_idx ON public.que_jobs USING btree (job_schema_version, queue, priority, run_at, id) WHERE ((finished_at IS NULL) AND (expired_at IS NULL));


--
-- Name: report_builder_published_data_units_report_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_builder_published_data_units_report_id_idx ON public.report_builder_published_graph_data_units USING btree (report_id);


--
-- Name: spam_reportable_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX spam_reportable_index ON public.spam_reports USING btree (spam_reportable_type, spam_reportable_id);


--
-- Name: users_unique_lower_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_unique_lower_email_idx ON public.users USING btree (lower((email)::text));


--
-- Name: que_jobs que_job_notify; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER que_job_notify AFTER INSERT ON public.que_jobs FOR EACH ROW EXECUTE FUNCTION public.que_job_notify();


--
-- Name: que_jobs que_state_notify; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER que_state_notify AFTER INSERT OR DELETE OR UPDATE ON public.que_jobs FOR EACH ROW EXECUTE FUNCTION public.que_state_notify();


--
-- Name: analytics_dimension_locales_fact_visits fk_rails_00698f2e02; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_dimension_locales_fact_visits
    ADD CONSTRAINT fk_rails_00698f2e02 FOREIGN KEY (dimension_locale_id) REFERENCES public.analytics_dimension_locales(id);


--
-- Name: events fk_rails_0434b48643; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT fk_rails_0434b48643 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: internal_comments fk_rails_04be8cf6ba; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internal_comments
    ADD CONSTRAINT fk_rails_04be8cf6ba FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: invites fk_rails_06b2d7a3a8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT fk_rails_06b2d7a3a8 FOREIGN KEY (invitee_id) REFERENCES public.users(id);


--
-- Name: invites fk_rails_0b6ac3e1da; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT fk_rails_0b6ac3e1da FOREIGN KEY (inviter_id) REFERENCES public.users(id);


--
-- Name: ideas fk_rails_0e5b472696; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT fk_rails_0e5b472696 FOREIGN KEY (creation_phase_id) REFERENCES public.phases(id);


--
-- Name: spam_reports fk_rails_121f3a2011; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spam_reports
    ADD CONSTRAINT fk_rails_121f3a2011 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: analysis_analyses fk_rails_16b3d1e637; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_analyses
    ADD CONSTRAINT fk_rails_16b3d1e637 FOREIGN KEY (main_custom_field_id) REFERENCES public.custom_fields(id);


--
-- Name: areas_static_pages fk_rails_1fc601f42c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_static_pages
    ADD CONSTRAINT fk_rails_1fc601f42c FOREIGN KEY (area_id) REFERENCES public.areas(id);


--
-- Name: project_images fk_rails_2119c24213; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_images
    ADD CONSTRAINT fk_rails_2119c24213 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: idea_import_files fk_rails_229b6de93f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_import_files
    ADD CONSTRAINT fk_rails_229b6de93f FOREIGN KEY (parent_id) REFERENCES public.idea_import_files(id);


--
-- Name: areas_static_pages fk_rails_231f268568; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_static_pages
    ADD CONSTRAINT fk_rails_231f268568 FOREIGN KEY (static_page_id) REFERENCES public.static_pages(id);


--
-- Name: events_attendances fk_rails_29ccdf5b04; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_attendances
    ADD CONSTRAINT fk_rails_29ccdf5b04 FOREIGN KEY (attendee_id) REFERENCES public.users(id);


--
-- Name: analysis_analyses fk_rails_2a92a64a56; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_analyses
    ADD CONSTRAINT fk_rails_2a92a64a56 FOREIGN KEY (phase_id) REFERENCES public.phases(id);


--
-- Name: phases fk_rails_2c74f68dd3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT fk_rails_2c74f68dd3 FOREIGN KEY (manual_voters_last_updated_by_id) REFERENCES public.users(id);


--
-- Name: cosponsorships fk_rails_2d026b99a2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cosponsorships
    ADD CONSTRAINT fk_rails_2d026b99a2 FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: phase_files fk_rails_33852a9a71; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phase_files
    ADD CONSTRAINT fk_rails_33852a9a71 FOREIGN KEY (phase_id) REFERENCES public.phases(id);


--
-- Name: volunteering_volunteers fk_rails_33a154a9ba; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteering_volunteers
    ADD CONSTRAINT fk_rails_33a154a9ba FOREIGN KEY (cause_id) REFERENCES public.volunteering_causes(id);


--
-- Name: nav_bar_items fk_rails_34143a680f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nav_bar_items
    ADD CONSTRAINT fk_rails_34143a680f FOREIGN KEY (static_page_id) REFERENCES public.static_pages(id);


--
-- Name: analysis_comments_summaries fk_rails_37becdebb0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_comments_summaries
    ADD CONSTRAINT fk_rails_37becdebb0 FOREIGN KEY (background_task_id) REFERENCES public.analysis_background_tasks(id);


--
-- Name: custom_field_option_images fk_rails_3814d72daa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_field_option_images
    ADD CONSTRAINT fk_rails_3814d72daa FOREIGN KEY (custom_field_option_id) REFERENCES public.custom_field_options(id);


--
-- Name: baskets_ideas fk_rails_39a1b51358; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baskets_ideas
    ADD CONSTRAINT fk_rails_39a1b51358 FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: analysis_analyses fk_rails_3c57357702; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_analyses
    ADD CONSTRAINT fk_rails_3c57357702 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: followers fk_rails_3d258d3942; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.followers
    ADD CONSTRAINT fk_rails_3d258d3942 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: email_campaigns_examples fk_rails_465d6356b2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_examples
    ADD CONSTRAINT fk_rails_465d6356b2 FOREIGN KEY (recipient_id) REFERENCES public.users(id);


--
-- Name: notifications fk_rails_46dd2ccfd1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_46dd2ccfd1 FOREIGN KEY (phase_id) REFERENCES public.phases(id);


--
-- Name: notifications fk_rails_47abdd0847; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_47abdd0847 FOREIGN KEY (project_review_id) REFERENCES public.project_reviews(id);


--
-- Name: notifications fk_rails_4aea6afa11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_4aea6afa11 FOREIGN KEY (recipient_id) REFERENCES public.users(id);


--
-- Name: analytics_dimension_projects_fact_visits fk_rails_4ecebb6e8a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_dimension_projects_fact_visits
    ADD CONSTRAINT fk_rails_4ecebb6e8a FOREIGN KEY (fact_visit_id) REFERENCES public.analytics_fact_visits(id);


--
-- Name: permissions_custom_fields fk_rails_50335fc43f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions_custom_fields
    ADD CONSTRAINT fk_rails_50335fc43f FOREIGN KEY (custom_field_id) REFERENCES public.custom_fields(id);


--
-- Name: identities fk_rails_5373344100; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identities
    ADD CONSTRAINT fk_rails_5373344100 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications fk_rails_5471f55cd6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_5471f55cd6 FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: notifications fk_rails_575368d182; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_575368d182 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: ideas fk_rails_5ac7668cd3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT fk_rails_5ac7668cd3 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: idea_imports fk_rails_5ea1f11fd5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_imports
    ADD CONSTRAINT fk_rails_5ea1f11fd5 FOREIGN KEY (import_user_id) REFERENCES public.users(id);


--
-- Name: analysis_taggings fk_rails_604cfbcd8d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_taggings
    ADD CONSTRAINT fk_rails_604cfbcd8d FOREIGN KEY (input_id) REFERENCES public.ideas(id);


--
-- Name: internal_comments fk_rails_617a7ea994; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internal_comments
    ADD CONSTRAINT fk_rails_617a7ea994 FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: idea_imports fk_rails_636c77bdd1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_imports
    ADD CONSTRAINT fk_rails_636c77bdd1 FOREIGN KEY (file_id) REFERENCES public.idea_import_files(id);


--
-- Name: notifications fk_rails_67be9591a3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_67be9591a3 FOREIGN KEY (cosponsorship_id) REFERENCES public.cosponsorships(id);


--
-- Name: idea_imports fk_rails_67f00886f9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_imports
    ADD CONSTRAINT fk_rails_67f00886f9 FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: report_builder_reports fk_rails_6988c9886e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_builder_reports
    ADD CONSTRAINT fk_rails_6988c9886e FOREIGN KEY (phase_id) REFERENCES public.phases(id);


--
-- Name: ideas fk_rails_6c9ab6d4f8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT fk_rails_6c9ab6d4f8 FOREIGN KEY (manual_votes_last_updated_by_id) REFERENCES public.users(id);


--
-- Name: groups_permissions fk_rails_6fa6389d80; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups_permissions
    ADD CONSTRAINT fk_rails_6fa6389d80 FOREIGN KEY (permission_id) REFERENCES public.permissions(id);


--
-- Name: email_campaigns_campaigns_groups fk_rails_712f4ad915; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_campaigns_groups
    ADD CONSTRAINT fk_rails_712f4ad915 FOREIGN KEY (campaign_id) REFERENCES public.email_campaigns_campaigns(id);


--
-- Name: ideas fk_rails_730408dafc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT fk_rails_730408dafc FOREIGN KEY (idea_status_id) REFERENCES public.idea_statuses(id);


--
-- Name: groups_projects fk_rails_73e1dee5fd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups_projects
    ADD CONSTRAINT fk_rails_73e1dee5fd FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: analysis_additional_custom_fields fk_rails_74744744a6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_additional_custom_fields
    ADD CONSTRAINT fk_rails_74744744a6 FOREIGN KEY (analysis_id) REFERENCES public.analysis_analyses(id);


--
-- Name: analysis_questions fk_rails_74e779db86; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_questions
    ADD CONSTRAINT fk_rails_74e779db86 FOREIGN KEY (background_task_id) REFERENCES public.analysis_background_tasks(id);


--
-- Name: analysis_heatmap_cells fk_rails_7a39fbbdee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_heatmap_cells
    ADD CONSTRAINT fk_rails_7a39fbbdee FOREIGN KEY (analysis_id) REFERENCES public.analysis_analyses(id);


--
-- Name: activities fk_rails_7e11bb717f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT fk_rails_7e11bb717f FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: email_campaigns_campaign_email_commands fk_rails_7f284a4f09; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_campaign_email_commands
    ADD CONSTRAINT fk_rails_7f284a4f09 FOREIGN KEY (recipient_id) REFERENCES public.users(id);


--
-- Name: comments fk_rails_7fbb3b1416; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_rails_7fbb3b1416 FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: polls_response_options fk_rails_80d00e60ae; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_response_options
    ADD CONSTRAINT fk_rails_80d00e60ae FOREIGN KEY (option_id) REFERENCES public.polls_options(id);


--
-- Name: report_builder_reports fk_rails_81137213da; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_builder_reports
    ADD CONSTRAINT fk_rails_81137213da FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: projects_allowed_input_topics fk_rails_812b6d9149; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_allowed_input_topics
    ADD CONSTRAINT fk_rails_812b6d9149 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: projects_topics fk_rails_812b6d9149; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_topics
    ADD CONSTRAINT fk_rails_812b6d9149 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: notifications fk_rails_81c11ef894; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_81c11ef894 FOREIGN KEY (internal_comment_id) REFERENCES public.internal_comments(id);


--
-- Name: impact_tracking_pageviews fk_rails_82dc979276; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.impact_tracking_pageviews
    ADD CONSTRAINT fk_rails_82dc979276 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: ideas_phases fk_rails_845d7ca944; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas_phases
    ADD CONSTRAINT fk_rails_845d7ca944 FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: notifications fk_rails_849e0c7eb7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_849e0c7eb7 FOREIGN KEY (spam_report_id) REFERENCES public.spam_reports(id);


--
-- Name: analysis_additional_custom_fields fk_rails_857115261d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_additional_custom_fields
    ADD CONSTRAINT fk_rails_857115261d FOREIGN KEY (custom_field_id) REFERENCES public.custom_fields(id);


--
-- Name: email_campaigns_campaigns fk_rails_87e592c9f5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_campaigns
    ADD CONSTRAINT fk_rails_87e592c9f5 FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: user_custom_fields_representativeness_ref_distributions fk_rails_8cabeff294; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_custom_fields_representativeness_ref_distributions
    ADD CONSTRAINT fk_rails_8cabeff294 FOREIGN KEY (custom_field_id) REFERENCES public.custom_fields(id);


--
-- Name: static_pages_topics fk_rails_8e3f01dacd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.static_pages_topics
    ADD CONSTRAINT fk_rails_8e3f01dacd FOREIGN KEY (static_page_id) REFERENCES public.static_pages(id);


--
-- Name: areas_projects fk_rails_8fb43a173d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_projects
    ADD CONSTRAINT fk_rails_8fb43a173d FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: areas fk_rails_901fc7a65b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT fk_rails_901fc7a65b FOREIGN KEY (custom_field_option_id) REFERENCES public.custom_field_options(id);


--
-- Name: notifications fk_rails_9268535f02; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_9268535f02 FOREIGN KEY (comment_id) REFERENCES public.comments(id);


--
-- Name: notifications fk_rails_97eb4c3a35; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_97eb4c3a35 FOREIGN KEY (invite_id) REFERENCES public.invites(id);


--
-- Name: authoring_assistance_responses fk_rails_98155ccbce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authoring_assistance_responses
    ADD CONSTRAINT fk_rails_98155ccbce FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: memberships fk_rails_99326fb65d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT fk_rails_99326fb65d FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: analytics_fact_visits fk_rails_9b5a82cb55; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_fact_visits
    ADD CONSTRAINT fk_rails_9b5a82cb55 FOREIGN KEY (dimension_referrer_type_id) REFERENCES public.analytics_dimension_referrer_types(id);


--
-- Name: event_images fk_rails_9dd6f2f888; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_images
    ADD CONSTRAINT fk_rails_9dd6f2f888 FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: areas_projects fk_rails_9ecfc9d2b9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_projects
    ADD CONSTRAINT fk_rails_9ecfc9d2b9 FOREIGN KEY (area_id) REFERENCES public.areas(id);


--
-- Name: notifications fk_rails_a2016447bc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_a2016447bc FOREIGN KEY (initiating_user_id) REFERENCES public.users(id);


--
-- Name: notifications fk_rails_a2cfad997d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_a2cfad997d FOREIGN KEY (official_feedback_id) REFERENCES public.official_feedbacks(id);


--
-- Name: analytics_fact_visits fk_rails_a34b51c948; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_fact_visits
    ADD CONSTRAINT fk_rails_a34b51c948 FOREIGN KEY (dimension_date_last_action_id) REFERENCES public.analytics_dimension_dates(date);


--
-- Name: event_files fk_rails_a590d6ddde; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_files
    ADD CONSTRAINT fk_rails_a590d6ddde FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: groups_permissions fk_rails_a5c3527604; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups_permissions
    ADD CONSTRAINT fk_rails_a5c3527604 FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: ideas fk_rails_a7a91f1df3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT fk_rails_a7a91f1df3 FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: analytics_fact_visits fk_rails_a9aa810ecf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_fact_visits
    ADD CONSTRAINT fk_rails_a9aa810ecf FOREIGN KEY (dimension_date_first_action_id) REFERENCES public.analytics_dimension_dates(date);


--
-- Name: memberships fk_rails_aaf389f138; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT fk_rails_aaf389f138 FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: maps_layers fk_rails_abbf8658b2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps_layers
    ADD CONSTRAINT fk_rails_abbf8658b2 FOREIGN KEY (map_config_id) REFERENCES public.maps_map_configs(id);


--
-- Name: project_reviews fk_rails_ac7bc0a42f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_reviews
    ADD CONSTRAINT fk_rails_ac7bc0a42f FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: analysis_tags fk_rails_afc2d02258; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_tags
    ADD CONSTRAINT fk_rails_afc2d02258 FOREIGN KEY (analysis_id) REFERENCES public.analysis_analyses(id);


--
-- Name: phases fk_rails_b0efe660f5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT fk_rails_b0efe660f5 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: baskets fk_rails_b3d04c10d5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baskets
    ADD CONSTRAINT fk_rails_b3d04c10d5 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: custom_field_options fk_rails_b48da9e6c7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_field_options
    ADD CONSTRAINT fk_rails_b48da9e6c7 FOREIGN KEY (custom_field_id) REFERENCES public.custom_fields(id);


--
-- Name: official_feedbacks fk_rails_b4a1624855; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_feedbacks
    ADD CONSTRAINT fk_rails_b4a1624855 FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: notifications fk_rails_b894d506a0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_b894d506a0 FOREIGN KEY (basket_id) REFERENCES public.baskets(id);


--
-- Name: polls_options fk_rails_bb813b4549; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_options
    ADD CONSTRAINT fk_rails_bb813b4549 FOREIGN KEY (question_id) REFERENCES public.polls_questions(id);


--
-- Name: ideas_phases fk_rails_bd36415a82; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas_phases
    ADD CONSTRAINT fk_rails_bd36415a82 FOREIGN KEY (phase_id) REFERENCES public.phases(id);


--
-- Name: analysis_background_tasks fk_rails_bde9116e72; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_background_tasks
    ADD CONSTRAINT fk_rails_bde9116e72 FOREIGN KEY (analysis_id) REFERENCES public.analysis_analyses(id);


--
-- Name: project_files fk_rails_c26fbba4b3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_files
    ADD CONSTRAINT fk_rails_c26fbba4b3 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: ideas fk_rails_c32c787647; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT fk_rails_c32c787647 FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: idea_images fk_rails_c349bb4ac3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_images
    ADD CONSTRAINT fk_rails_c349bb4ac3 FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: custom_field_matrix_statements fk_rails_c379cdcd80; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_field_matrix_statements
    ADD CONSTRAINT fk_rails_c379cdcd80 FOREIGN KEY (custom_field_id) REFERENCES public.custom_fields(id);


--
-- Name: notifications fk_rails_c76d81b062; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_c76d81b062 FOREIGN KEY (inappropriate_content_flag_id) REFERENCES public.flag_inappropriate_content_inappropriate_content_flags(id);


--
-- Name: email_campaigns_deliveries fk_rails_c87ec11171; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_deliveries
    ADD CONSTRAINT fk_rails_c87ec11171 FOREIGN KEY (campaign_id) REFERENCES public.email_campaigns_campaigns(id);


--
-- Name: idea_import_files fk_rails_c93392afae; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_import_files
    ADD CONSTRAINT fk_rails_c93392afae FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: reactions fk_rails_c9b3bef597; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT fk_rails_c9b3bef597 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: analysis_insights fk_rails_cc6c7b26fc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_insights
    ADD CONSTRAINT fk_rails_cc6c7b26fc FOREIGN KEY (analysis_id) REFERENCES public.analysis_analyses(id);


--
-- Name: analysis_taggings fk_rails_cc8b68bfb4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_taggings
    ADD CONSTRAINT fk_rails_cc8b68bfb4 FOREIGN KEY (tag_id) REFERENCES public.analysis_tags(id);


--
-- Name: analytics_dimension_locales_fact_visits fk_rails_cd2a592e7b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_dimension_locales_fact_visits
    ADD CONSTRAINT fk_rails_cd2a592e7b FOREIGN KEY (fact_visit_id) REFERENCES public.analytics_fact_visits(id);


--
-- Name: static_page_files fk_rails_d0209b82ff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.static_page_files
    ADD CONSTRAINT fk_rails_d0209b82ff FOREIGN KEY (static_page_id) REFERENCES public.static_pages(id);


--
-- Name: projects fk_rails_d1892257e3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_rails_d1892257e3 FOREIGN KEY (default_assignee_id) REFERENCES public.users(id);


--
-- Name: groups_projects fk_rails_d6353758d5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups_projects
    ADD CONSTRAINT fk_rails_d6353758d5 FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: projects_allowed_input_topics fk_rails_db7813bfef; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_allowed_input_topics
    ADD CONSTRAINT fk_rails_db7813bfef FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: projects_topics fk_rails_db7813bfef; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_topics
    ADD CONSTRAINT fk_rails_db7813bfef FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: analysis_summaries fk_rails_dbd13460f0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_summaries
    ADD CONSTRAINT fk_rails_dbd13460f0 FOREIGN KEY (background_task_id) REFERENCES public.analysis_background_tasks(id);


--
-- Name: project_folders_files fk_rails_dc7aeb6534; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_folders_files
    ADD CONSTRAINT fk_rails_dc7aeb6534 FOREIGN KEY (project_folder_id) REFERENCES public.project_folders_folders(id);


--
-- Name: project_folders_images fk_rails_dcbc962cfe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_folders_images
    ADD CONSTRAINT fk_rails_dcbc962cfe FOREIGN KEY (project_folder_id) REFERENCES public.project_folders_folders(id);


--
-- Name: impact_tracking_pageviews fk_rails_dd3b2cc184; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.impact_tracking_pageviews
    ADD CONSTRAINT fk_rails_dd3b2cc184 FOREIGN KEY (session_id) REFERENCES public.impact_tracking_sessions(id);


--
-- Name: official_feedbacks fk_rails_ddd7e21dfa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_feedbacks
    ADD CONSTRAINT fk_rails_ddd7e21dfa FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: project_reviews fk_rails_de7c38cbc4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_reviews
    ADD CONSTRAINT fk_rails_de7c38cbc4 FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: baskets_ideas fk_rails_dfb57cbce2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baskets_ideas
    ADD CONSTRAINT fk_rails_dfb57cbce2 FOREIGN KEY (basket_id) REFERENCES public.baskets(id);


--
-- Name: permissions_custom_fields fk_rails_e211dc8f99; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions_custom_fields
    ADD CONSTRAINT fk_rails_e211dc8f99 FOREIGN KEY (permission_id) REFERENCES public.permissions(id);


--
-- Name: analysis_comments_summaries fk_rails_e51f754cf7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_comments_summaries
    ADD CONSTRAINT fk_rails_e51f754cf7 FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: custom_field_bins fk_rails_e6f48b841d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_field_bins
    ADD CONSTRAINT fk_rails_e6f48b841d FOREIGN KEY (custom_field_option_id) REFERENCES public.custom_field_options(id);


--
-- Name: nav_bar_items fk_rails_e8076fb9f6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nav_bar_items
    ADD CONSTRAINT fk_rails_e8076fb9f6 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: polls_response_options fk_rails_e871bf6e26; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_response_options
    ADD CONSTRAINT fk_rails_e871bf6e26 FOREIGN KEY (response_id) REFERENCES public.polls_responses(id);


--
-- Name: static_pages_topics fk_rails_edc8786515; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.static_pages_topics
    ADD CONSTRAINT fk_rails_edc8786515 FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: idea_files fk_rails_efb12f53ad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_files
    ADD CONSTRAINT fk_rails_efb12f53ad FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: custom_field_bins fk_rails_f09b1bc4cd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_field_bins
    ADD CONSTRAINT fk_rails_f09b1bc4cd FOREIGN KEY (custom_field_id) REFERENCES public.custom_fields(id);


--
-- Name: notifications fk_rails_f1d8986d29; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_f1d8986d29 FOREIGN KEY (idea_status_id) REFERENCES public.idea_statuses(id);


--
-- Name: report_builder_published_graph_data_units fk_rails_f21a19c203; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_builder_published_graph_data_units
    ADD CONSTRAINT fk_rails_f21a19c203 FOREIGN KEY (report_id) REFERENCES public.report_builder_reports(id);


--
-- Name: cosponsorships fk_rails_f32533b783; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cosponsorships
    ADD CONSTRAINT fk_rails_f32533b783 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: comments fk_rails_f44b1e3c8a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_rails_f44b1e3c8a FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: events_attendances fk_rails_fba307ba3b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_attendances
    ADD CONSTRAINT fk_rails_fba307ba3b FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: ideas_topics fk_rails_fd874ecf4b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas_topics
    ADD CONSTRAINT fk_rails_fd874ecf4b FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: project_reviews fk_rails_fdbeb12ddd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_reviews
    ADD CONSTRAINT fk_rails_fdbeb12ddd FOREIGN KEY (requester_id) REFERENCES public.users(id);


--
-- Name: ideas_topics fk_rails_ff1788eb50; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas_topics
    ADD CONSTRAINT fk_rails_ff1788eb50 FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- PostgreSQL database dump complete
--

SET search_path TO public,shared_extensions;

INSERT INTO "schema_migrations" (version) VALUES
('20250610112901'),
('20250609151800'),
('20250605090517'),
('20250519080057'),
('20250513160156'),
('20250509140651'),
('20250509131056'),
('20250502112945'),
('20250501134516'),
('20250416120221'),
('20250415132943'),
('20250415094344'),
('20250409111817'),
('20250327095857'),
('20250320010716'),
('20250319145637'),
('20250317825496'),
('20250317143543'),
('20250311141109'),
('20250307924725'),
('20250305202848'),
('20250305111507'),
('20250224150953'),
('20250220161323'),
('20250219104523'),
('20250218094339'),
('20250217295025'),
('20250210181753'),
('20250204143605'),
('20250120125531'),
('20250117121004'),
('20241230172612'),
('20241230165518'),
('20241230165323'),
('20241227103433'),
('20241226093506'),
('20241224115952'),
('20241204144321'),
('20241204133717'),
('20241203151945'),
('20241127093339'),
('20241127074734'),
('20241125094100'),
('20241125094000'),
('20241115141717'),
('20241115141553'),
('20241112110758'),
('20241105081014'),
('20241105053934'),
('20241105053818'),
('20241029080612'),
('20241028162618'),
('20241024110349'),
('20241022101049'),
('20241016201503'),
('20241011816395'),
('20241011101454'),
('20241008143004'),
('20241002200522'),
('20241001101704'),
('20240926175000'),
('20240923112801'),
('20240923112800'),
('20240917181018'),
('20240911143007'),
('20240829185625'),
('20240826083227'),
('20240821135150'),
('20240814163522'),
('20240814133336'),
('20240812115140'),
('20240806161121'),
('20240805121645'),
('20240731223530'),
('20240731181623'),
('20240730093933'),
('20240729141927'),
('20240722090955'),
('20240710101033'),
('202407081751'),
('20240612134240'),
('20240606112752'),
('20240516113700'),
('20240510103700'),
('20240508133950'),
('20240508124400'),
('20240504212048'),
('20240419100508'),
('20240418081854'),
('20240417150820'),
('20240417064819'),
('20240409150000'),
('20240328141200'),
('20240305122502'),
('20240301120023'),
('20240229195843'),
('20240228145938'),
('20240227092300'),
('20240226170510'),
('20240221145522'),
('20240219104431'),
('20240219104430'),
('20240214125557'),
('20240212133704'),
('20240206165004'),
('20240201141520'),
('20240130170644'),
('20240130142750'),
('20240126122702'),
('20240124173411'),
('20240123102956'),
('20240115142433'),
('20240112103545'),
('20231214100537'),
('20231212151032'),
('20231130093345'),
('20231124114112'),
('20231124112723'),
('20231124090234'),
('20231123173159'),
('20231123161330'),
('20231123141534'),
('20231120090516'),
('20231110112415'),
('20231109101517'),
('20231103094549'),
('20231031175023'),
('20231024082513'),
('20231018083110'),
('20231003095622'),
('20230927135924'),
('20230915391649'),
('20230913121819'),
('20230911121820'),
('20230906104541'),
('20230825121819'),
('20230825121818'),
('20230823204209'),
('20230817134213'),
('20230817133411'),
('20230816104548'),
('20230815182301'),
('20230815119289'),
('20230815085922'),
('20230814115846'),
('20230811123114'),
('20230804142723'),
('20230803112021'),
('20230801141534'),
('20230801135355'),
('20230801095755'),
('20230728160743'),
('20230728130913'),
('20230727145653'),
('20230727090914'),
('20230726160134'),
('20230726150159'),
('20230725142113'),
('20230725121109'),
('20230719221540'),
('20230719221539'),
('20230718214736'),
('20230718124121'),
('20230718121501'),
('20230710143815'),
('20230705172856'),
('20230703175732'),
('20230703112343'),
('20230629120434'),
('20230629095724'),
('20230623085057'),
('20230622132238'),
('20230621144312'),
('20230621091448'),
('20230620114801'),
('20230616134441'),
('20230609161522'),
('20230608120425'),
('20230608120051'),
('20230607162320'),
('20230607142901'),
('20230606132255'),
('20230605133845'),
('20230601085753'),
('20230524151508'),
('20230524085443'),
('20230519085843'),
('20230518133943'),
('20230518094411'),
('20230517145937'),
('20230517064632'),
('20230516150847'),
('20230516135820'),
('20230405162820'),
('20230403145652'),
('20230321153659'),
('20230314110825'),
('20230307101320'),
('20230213120148'),
('20230208142802'),
('20230206090743'),
('20230131143907'),
('20230131122140'),
('20230131091656'),
('20230127201927'),
('20221205112729'),
('20221205095831'),
('20221202110054'),
('20221118094022'),
('20221115113353'),
('20221114094435'),
('20221111132019'),
('20221110105544'),
('20221107124858'),
('20221103153024'),
('20221028082913'),
('20221027170719'),
('20221027125738'),
('20221025131832'),
('20221025100507'),
('20221021140619'),
('20221018135644'),
('20221011092349'),
('20221006100512'),
('20221006095042'),
('20221006071220'),
('20221001123808'),
('20220929125457'),
('20220929125456'),
('20220927114325'),
('20220927091942'),
('20220906074349'),
('20220831171634'),
('20220831142106'),
('20220831102114'),
('20220830144847'),
('20220826025846'),
('20220826025845'),
('20220826025844'),
('20220826025843'),
('20220826025842'),
('20220826025841'),
('20220826025840'),
('20220822140950'),
('20220822140949'),
('20220818165037'),
('20220810084347'),
('20220808074431'),
('20220719103052'),
('20220713141438'),
('20220707102050'),
('20220630084221'),
('20220620101315'),
('20220615095516'),
('20220614135644'),
('20220610072149'),
('20220531123916'),
('20220523110954'),
('20220415074726'),
('20220407131522'),
('20220324073642'),
('20220308184000'),
('20220302143958'),
('20220214110500'),
('20220211143841'),
('20220207103216'),
('20220126110341'),
('20220120154239'),
('20220114095033'),
('20220112081701'),
('20212006161358'),
('20212006161357'),
('20211906161362'),
('20211906161361'),
('20211906161360'),
('20211906161359'),
('20211806161357'),
('20211806161356'),
('20211806161355'),
('20211806161354'),
('20210902121357'),
('20210902121356'),
('20210902121355'),
('20210722110109'),
('20210624163536'),
('20210619133856'),
('20210601061247'),
('20210521101107'),
('20210518143118'),
('20210512094502'),
('20210506151054'),
('20210430154637'),
('20210413172107'),
('20210402103419'),
('20210324181814'),
('20210324181315'),
('20210324164740'),
('20210324164613'),
('20210319161957'),
('20210319100008'),
('20210317114361'),
('20210317114360'),
('20210316113654'),
('20210312123927'),
('20210304203413'),
('20210217112905'),
('20210211144443'),
('20210127112937'),
('20210127112825'),
('20210127112755'),
('20210127105555'),
('20210119144531'),
('20210112155555'),
('20201217170635'),
('20201204134337'),
('20201130161115'),
('20201127160903'),
('20201120190900'),
('20201120173700'),
('20201116092907'),
('20201116092906'),
('20201102093045'),
('20201029180155'),
('20201022160000'),
('20201018122834'),
('20201015180356'),
('20201014180247'),
('20201007102916'),
('20201001174500'),
('20200911150057'),
('20200902151045'),
('20200820141351'),
('20200807132541'),
('20200805132331'),
('20200527094026'),
('20200527093956'),
('20200519164633'),
('20200423123927'),
('20200325160114'),
('20200319101312'),
('20200318220615'),
('20200318220614'),
('20200316155355'),
('20200316142822'),
('20200316142821'),
('20200316142820'),
('20200311132551'),
('20200310101259'),
('20200306160918'),
('20200226124456'),
('20200213001613'),
('20200206165218'),
('20200206162013'),
('20200206081103'),
('20200131133006'),
('20200131130350'),
('20200131124534'),
('20200109163736'),
('20191218161144'),
('20191213130342'),
('20191213112024'),
('20191211104007'),
('20191210205216'),
('20191209183623'),
('20191209135917'),
('20191114092523'),
('20191023121111'),
('20191014135916'),
('20191008115234'),
('20190909124938'),
('20190909124937'),
('20190906093107'),
('20190905123110'),
('20190905123108'),
('20190904135344'),
('20190904135343'),
('20190816143358'),
('20190730131947'),
('20190724095644'),
('20190701091036'),
('20190607132326'),
('20190605125206'),
('20190604135000'),
('20190603142853'),
('20190603141415'),
('20190603135926'),
('20190603100803'),
('20190603100709'),
('20190531143638'),
('20190528101954'),
('20190527091133'),
('20190325155516'),
('20190325142711'),
('20190318145229'),
('20190313091027'),
('20190312154517'),
('20190220152327'),
('20190215155920'),
('20190211134223'),
('20190211103921'),
('20190129100321'),
('20190124094814'),
('20190107123605'),
('20181210113428'),
('20181205134744'),
('20181022092934'),
('20181011143305'),
('20180920155127'),
('20180920155012'),
('20180919144612'),
('20180913155502'),
('20180913085920'),
('20180913085107'),
('20180912135727'),
('20180829162620'),
('20180824094903'),
('20180815114124'),
('20180815114123'),
('20180815114122'),
('20180815114121'),
('20180813093429'),
('20180809134021'),
('20180809133236'),
('20180801130039'),
('20180705085133'),
('20180610165230'),
('20180516143348'),
('20180424190024'),
('20180424190023'),
('20180423123634'),
('20180423123610'),
('20180423123552'),
('20180423120217'),
('20180412140227'),
('20180405195146'),
('20180405090646'),
('20180404092302'),
('20180328123240'),
('20180327132833'),
('20180327085216'),
('20180309160219'),
('20180307132304'),
('20180302145039'),
('20180302100342'),
('20180221143137'),
('20180220144702'),
('20180220142344'),
('20180215130118'),
('20180215090033'),
('20180209161249'),
('20180206132516'),
('20180118125241'),
('20180117105551'),
('20180117103530'),
('20180108153406'),
('20180108144119'),
('20180108144026'),
('20180108134711'),
('20180103163513'),
('20171221145649'),
('20171218134052'),
('20171209082850'),
('20171204155602'),
('20171127103900'),
('20171117155422'),
('20171117114456'),
('20171115092024'),
('20171113100102'),
('20171106212610'),
('20171101102506'),
('20171031131310'),
('20171029143741'),
('20171023192224'),
('20171022182428'),
('20171020101837'),
('20171010114644'),
('20171010114629'),
('20171010091219'),
('20170918101800'),
('20170719172958'),
('20170719160834'),
('20170718121258'),
('20170718095819'),
('20170705093317'),
('20170705093051'),
('20170704729304'),
('20170703234313'),
('20170620083943'),
('20170620074738'),
('20170607123146'),
('20170602105428'),
('20170531144653'),
('20170525125712'),
('20170520134018'),
('20170520132308'),
('20170509093623'),
('20170503161621'),
('20170424201042'),
('20170418104454'),
('20170415160722'),
('20170410152320'),
('20170407113052'),
('20170330122943'),
('20170319000059'),
('20170318181018'),
('20170318155729'),
('20170318144700'),
('20170318143940'),
('20170318141825'),
('20170317151309'),
('20170317133413'),
('20170314053812'),
('20170302155043'),
('20170301182502');

