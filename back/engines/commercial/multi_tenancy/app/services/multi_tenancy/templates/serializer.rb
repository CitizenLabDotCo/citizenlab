# frozen_string_literal: true

module MultiTenancy
  module Templates
    class Serializer < ::TemplateService
      def initialize(tenant)
        super()
        @tenant = tenant
      end

      def run
        models = Apartment::Tenant.switch(@tenant.schema_name) do
          {
            'home_page'                            => yml_home_pages,
            'area'                                 => yml_areas,
            'topic'                                => yml_topics,
            'project_folders/folder'               => yml_project_folders,
            'project_folders/image'                => yml_project_folder_images,
            'project_folders/file'                 => yml_project_folder_files,
            'project'                              => yml_projects,
            'project_file'                         => yml_project_files,
            'project_image'                        => yml_project_images,
            'phase'                                => yml_phases,
            'phase_file'                           => yml_phase_files,
            'custom_form'                          => yml_custom_forms,
            'custom_field'                         => yml_custom_fields,
            'custom_field_option'                  => yml_custom_field_options,
            'user'                                 => yml_users,
            'email_campaigns/unsubscription_token' => yml_unsubscription_tokens,
            'projects_allowed_input_topic'         => yml_projects_allowed_input_topics,
            'areas_project'                        => yml_areas_projects,
            'email_campaigns/campaigns'            => yml_campaigns,
            'basket'                               => yml_baskets,
            'event'                                => yml_events,
            'event_file'                           => yml_event_files,
            'group'                                => yml_groups,
            'groups_project'                       => yml_groups_projects,
            'permission'                           => yml_permissions,
            'groups_permission'                    => yml_groups_permissions,
            'membership'                           => yml_memberships,
            'static_page'                          => yml_static_pages,
            'nav_bar_item'                         => yml_nav_bar_items,
            'static_page_file'                     => yml_static_page_files,
            'idea_status'                          => yml_idea_statuses,
            'idea'                                 => yml_ideas,
            'baskets_idea'                         => yml_baskets_ideas,
            'idea_file'                            => yml_idea_files,
            'idea_image'                           => yml_idea_images,
            'ideas_phase'                          => yml_ideas_phases,
            'ideas_topic'                          => yml_ideas_topics,
            'initiative_status'                    => yml_initiative_statuses,
            'initiative'                           => yml_initiatives,
            'areas_initiative'                     => yml_areas_initiatives,
            'initiative_file'                      => yml_initiative_files,
            'initiative_image'                     => yml_initiative_images,
            'initiatives_topic'                    => yml_initiatives_topics,
            'official_feedback'                    => yml_official_feedback,
            'comment'                              => yml_comments,
            'vote'                                 => yml_votes,
            'polls/question'                       => yml_poll_questions,
            'polls/option'                         => yml_poll_options,
            'polls/response'                       => yml_poll_responses,
            'polls/response_option'                => yml_poll_response_options,
            'volunteering/cause'                   => yml_volunteering_causes,
            'volunteering/volunteer'               => yml_volunteering_volunteers,
            'custom_maps/map_config'               => yml_maps_map_configs,
            'custom_maps/layer'                    => yml_maps_layers,
            'custom_maps/legend_item'              => yml_maps_legend_items,
            'content_builder/layout'               => yml_content_builder_layouts,
            'content_builder/layout_image'         => yml_content_builder_layout_images
          }
        end
        { 'models' => models }
      end

      private

      def yml_content_builder_layouts
        ContentBuilder::Layout.all.map do |layout|
          yml_layout = {
            'content_buildable_ref' => lookup_ref(layout.content_buildable_id, :project),
            'content_buildable_type' => layout.content_buildable_type,
            'code' => layout.code,
            'enabled' => layout.enabled,
            'craftjs_jsonmultiloc' => layout.craftjs_jsonmultiloc,
            'created_at' => layout.created_at.to_s,
            'updated_at' => layout.updated_at.to_s
          }
          store_ref yml_layout, layout.id, :content_builder_layout
          yml_layout
        end
      end

      def yml_content_builder_layout_images
        ContentBuilder::LayoutImage.all.map do |image|
          {
            'code' => image.code,
            'remote_image_url' => image.image_url,
            'created_at' => image.created_at.to_s,
            'updated_at' => image.updated_at.to_s
          }
        end
      end

      def yml_home_pages
        HomePage.all.map do |hp|
          yml_home_page = {
            'top_info_section_enabled' => hp.top_info_section_enabled,
            'top_info_section_multiloc' => hp.top_info_section_multiloc,
            'bottom_info_section_enabled' => hp.bottom_info_section_enabled,
            'bottom_info_section_multiloc' => hp.bottom_info_section_multiloc,
            'events_widget_enabled' => hp.events_widget_enabled,
            'projects_enabled' => hp.projects_enabled,
            'projects_header_multiloc' => hp.projects_header_multiloc,
            'banner_avatars_enabled' => hp.banner_avatars_enabled,
            'banner_layout' => hp.banner_layout,
            'banner_signed_in_header_multiloc' => hp.banner_signed_in_header_multiloc,
            'banner_cta_signed_in_text_multiloc' => hp.banner_cta_signed_in_text_multiloc,
            'banner_cta_signed_in_type' => hp.banner_cta_signed_in_type,
            'banner_cta_signed_in_url' => hp.banner_cta_signed_in_url,
            'banner_signed_out_header_multiloc' => hp.banner_signed_out_header_multiloc,
            'banner_signed_out_subheader_multiloc' => hp.banner_signed_out_subheader_multiloc,
            'banner_signed_out_header_overlay_color' => hp.banner_signed_out_header_overlay_color,
            'banner_signed_out_header_overlay_opacity' => hp.banner_signed_out_header_overlay_opacity,
            'banner_cta_signed_out_text_multiloc' => hp.banner_cta_signed_out_text_multiloc,
            'banner_cta_signed_out_type' => hp.banner_cta_signed_out_type,
            'banner_cta_signed_out_url' => hp.banner_cta_signed_out_url,
            'remote_header_bg_url' => hp.header_bg_url,
            'created_at' => hp.created_at.to_s,
            'updated_at' => hp.updated_at.to_s
          }
          yml_home_page
        end
      end

      def yml_areas
        Area.all.map do |a|
          yml_area = {
            'title_multiloc' => a.title_multiloc,
            'description_multiloc' => a.description_multiloc,
            'created_at' => a.created_at.to_s,
            'updated_at' => a.updated_at.to_s,
            'ordering' => a.ordering
          }
          store_ref yml_area, a.id, :area
          yml_area
        end
      end

      def yml_custom_forms
        CustomForm.all.map do |c|
          yml_custom_form = {
            'created_at' => c.created_at.to_s,
            'updated_at' => c.updated_at.to_s,
            'participation_context_ref' => lookup_ref(c.participation_context_id, %i[project phase])
          }
          store_ref yml_custom_form, c.id, :custom_form
          yml_custom_form
        end
      end

      def yml_custom_fields
        CustomField.all.map do |field|
          yml_custom_field = {
            'resource_ref' => field.resource_id && lookup_ref(field.resource_id, :custom_form),
            'key' => field.key,
            'input_type' => field.input_type,
            'title_multiloc' => field.title_multiloc,
            'description_multiloc' => field.description_multiloc,
            'ordering' => field.ordering,
            'created_at' => field.created_at.to_s,
            'updated_at' => field.updated_at.to_s,
            'enabled' => field.enabled,
            'code' => field.code,
            'answer_visible_to' => field.answer_visible_to,
            'maximum' => field.maximum,
            'minimum_label_multiloc' => field.minimum_label_multiloc,
            'maximum_label_multiloc' => field.maximum_label_multiloc,
            'text_images_attributes' => field.text_images.map do |text_image|
              {
                'imageable_field' => text_image.imageable_field,
                'remote_image_url' => text_image.image_url,
                'text_reference' => text_image.text_reference,
                'created_at' => text_image.created_at.to_s,
                'updated_at' => text_image.updated_at.to_s
              }
            end
          }
          if field.resource_type == User.name
            yml_custom_field['resource_type'] = field.resource_type
            # No user custom fields are required anymore because
            # the user choices cannot be remembered.
          else
            yml_custom_field['resource_ref'] = field.resource_id && lookup_ref(field.resource_id, :custom_form)
            yml_custom_field['required'] = field.required
          end
          store_ref yml_custom_field, field.id, :custom_field
          yml_custom_field
        end
      end

      def yml_custom_field_options
        # Options of the domicile field do not need to be serialized.
        # They will be recreated from areas when loading the template.
        domicile_field = CustomField.find_by(code: 'domicile')
        options = domicile_field ? CustomFieldOption.where.not(custom_field: domicile_field) : CustomFieldOption

        options.all.map do |c|
          yml_custom_field_option = {
            'custom_field_ref' => lookup_ref(c.custom_field_id, :custom_field),
            'key' => c.key,
            'title_multiloc' => c.title_multiloc,
            'ordering' => c.ordering,
            'created_at' => c.created_at.to_s,
            'updated_at' => c.updated_at.to_s
          }
          store_ref yml_custom_field_option, c.id, :custom_field_option
          yml_custom_field_option
        end
      end

      def yml_topics
        Topic.all.map do |t|
          yml_topic = {
            'title_multiloc' => t.title_multiloc,
            'description_multiloc' => t.description_multiloc,
            'icon' => t.icon,
            'ordering' => t.ordering,
            'code' => t.code,
            'created_at' => t.created_at.to_s,
            'updated_at' => t.updated_at.to_s
          }
          store_ref yml_topic, t.id, :topic
          yml_topic
        end
      end

      def yml_users
        # Roles are left out so first user to login becomes
        # admin and because project ids of moderators would
        # become invalid.
        # Pending invitations are cleared out.

        # TODO: properly copy project moderator roles and domicile
        User.where('invite_status IS NULL or invite_status != ?', 'pending').map do |u|
          yml_user = {
            'email' => u.email,
            'password_digest' => u.password_digest,
            'created_at' => u.created_at.to_s,
            'updated_at' => u.updated_at.to_s,
            'remote_avatar_url' => u.avatar_url,
            'first_name' => u.first_name,
            'last_name' => u.last_name,
            'locale' => u.locale,
            'bio_multiloc' => u.bio_multiloc,
            'cl1_migrated' => u.cl1_migrated,
            'custom_field_values' => u.custom_field_values.delete_if { |k, v| v.nil? || (k == 'domicile') },
            'registration_completed_at' => u.registration_completed_at.to_s,
            'verified' => u.verified,
            'block_start_at' => u.block_start_at,
            'block_end_at' => u.block_end_at,
            'block_reason' => u.block_reason
          }
          unless yml_user['password_digest']
            yml_user['password'] = SecureRandom.urlsafe_base64 32
          end
          store_ref yml_user, u.id, :user
          yml_user
        end
      end

      def yml_project_folders
        ProjectFolders::Folder.all.map do |f|
          yml_folder = {
            'title_multiloc' => f.title_multiloc,
            'description_multiloc' => f.description_multiloc,
            'remote_header_bg_url' => f.header_bg_url,
            'description_preview_multiloc' => f.description_preview_multiloc,
            'created_at' => f.created_at.to_s,
            'updated_at' => f.updated_at.to_s,
            'admin_publication_attributes' => {
              'publication_status' => f.admin_publication.publication_status,
              'ordering' => f.admin_publication.ordering
            }
          }
          store_ref yml_folder, f.id, :project_folder
          store_ref yml_folder['admin_publication_attributes'], f.admin_publication.id, :admin_publication_attributes
          yml_folder
        end
      end

      def yml_project_folder_images
        ProjectFolders::Image.all.map do |p|
          {
            'project_folder_ref' => lookup_ref(p.project_folder_id, :project_folder),
            'remote_image_url' => p.image_url,
            'ordering' => p.ordering,
            'created_at' => p.created_at.to_s,
            'updated_at' => p.updated_at.to_s
          }
        end
      end

      def yml_project_folder_files
        ProjectFolders::File.all.map do |p|
          {
            'project_folder_ref' => lookup_ref(p.project_folder_id, :project_folder),
            'name' => p.name,
            'ordering' => p.ordering,
            'remote_file_url' => p.file_url,
            'created_at' => p.created_at.to_s,
            'updated_at' => p.updated_at.to_s
          }
        end
      end

      def yml_projects
        Project.all.map do |p|
          yml_project = yml_participation_context p
          yml_project.merge!({
            'title_multiloc' => p.title_multiloc,
            'description_multiloc' => p.description_multiloc,
            'created_at' => p.created_at.to_s,
            'updated_at' => p.updated_at.to_s,
            'remote_header_bg_url' => p.header_bg_url,
            'visible_to' => p.visible_to,
            'ideas_order' => p.ideas_order,
            'input_term' => p.input_term,
            'description_preview_multiloc' => p.description_preview_multiloc,
            'process_type' => p.process_type,
            'internal_role' => p.internal_role,
            'text_images_attributes' => p.text_images.map do |ti|
              {
                'imageable_field' => ti.imageable_field,
                'remote_image_url' => ti.image_url,
                'text_reference' => ti.text_reference,
                'created_at' => ti.created_at.to_s,
                'updated_at' => ti.updated_at.to_s
              }
            end,
            'include_all_areas' => p.include_all_areas
          })
          if p.admin_publication.present?
            yml_project['admin_publication_attributes'] = {
              'publication_status' => p.admin_publication.publication_status,
              'ordering' => p.admin_publication.ordering,
              'parent_ref' => lookup_ref(p.admin_publication.parent_id, :admin_publication_attributes)
            }
          end
          store_ref yml_project, p.id, :project
          yml_project
        end
      end

      def yml_project_files
        ProjectFile.all.map do |p|
          {
            'project_ref' => lookup_ref(p.project_id, :project),
            'name' => p.name,
            'ordering' => p.ordering,
            'remote_file_url' => p.file_url,
            'created_at' => p.created_at.to_s,
            'updated_at' => p.updated_at.to_s
          }
        end
      end

      def yml_project_images
        ProjectImage.all.map do |p|
          {
            'project_ref' => lookup_ref(p.project_id, :project),
            'remote_image_url' => p.image_url,
            'ordering' => p.ordering,
            'created_at' => p.created_at.to_s,
            'updated_at' => p.updated_at.to_s
          }
        end
      end

      def yml_projects_allowed_input_topics
        ProjectsAllowedInputTopic.all.map do |p|
          {
            'project_ref' => lookup_ref(p.project_id, :project),
            'topic_ref' => lookup_ref(p.topic_id, :topic),
            'ordering' => p.ordering,
            'created_at' => p.created_at.to_s,
            'updated_at' => p.updated_at.to_s
          }
        end
      end

      def yml_phases
        Phase.all.map do |p|
          yml_phase = yml_participation_context p
          yml_phase.merge!({
            'project_ref' => lookup_ref(p.project_id, :project),
            'title_multiloc' => p.title_multiloc,
            'description_multiloc' => p.description_multiloc,
            'start_at' => p.start_at.to_s,
            'end_at' => p.end_at.to_s,
            'ideas_order' => p.ideas_order,
            'input_term' => p.input_term,
            'created_at' => p.created_at.to_s,
            'updated_at' => p.updated_at.to_s,
            'text_images_attributes' => p.text_images.map do |ti|
              {
                'imageable_field' => ti.imageable_field,
                'remote_image_url' => ti.image_url,
                'text_reference' => ti.text_reference,
                'created_at' => ti.created_at.to_s,
                'updated_at' => ti.updated_at.to_s
              }
            end
          })
          store_ref yml_phase, p.id, :phase
          yml_phase
        end
      end

      def yml_phase_files
        PhaseFile.all.map do |p|
          {
            'phase_ref' => lookup_ref(p.phase_id, :phase),
            'name' => p.name,
            'ordering' => p.ordering,
            'remote_file_url' => p.file_url,
            'created_at' => p.created_at.to_s,
            'updated_at' => p.updated_at.to_s
          }
        end
      end

      def yml_participation_context(context)
        yml_pc = {
          'presentation_mode' => context.presentation_mode,
          'participation_method' => context.participation_method,
          'posting_enabled' => context.posting_enabled,
          'posting_method' => context.posting_method,
          'posting_limited_max' => context.posting_limited_max,
          'commenting_enabled' => context.commenting_enabled,
          'voting_enabled' => context.voting_enabled,
          'upvoting_method' => context.upvoting_method,
          'upvoting_limited_max' => context.upvoting_limited_max,
          'downvoting_enabled' => context.downvoting_enabled,
          'downvoting_method' => context.downvoting_method,
          'downvoting_limited_max' => context.downvoting_limited_max,
          'max_budget' => context.max_budget,
          'min_budget' => context.min_budget,
          'poll_anonymous' => context.poll_anonymous,
          'ideas_order' => context.ideas_order,
          'input_term' => context.input_term
        }
        if yml_pc['participation_method'] == 'survey'
          yml_pc['survey_embed_url'] = context.survey_embed_url
          yml_pc['survey_service'] = context.survey_service
        end
        yml_pc
      end

      def yml_areas_projects
        AreasProject.all.map do |a|
          {
            'area_ref' => lookup_ref(a.area_id, :area),
            'project_ref' => lookup_ref(a.project_id, :project)
          }
        end
      end

      def yml_campaigns
        EmailCampaigns::Campaign.where(type: 'EmailCampaigns::Campaigns::Manual').map do |c|
          yml_campaign = {
            'type' => c.type,
            'author_ref' => lookup_ref(c.author_id, :user),
            'enabled' => c.enabled,
            'sender' => c.sender,
            'subject_multiloc' => c.subject_multiloc,
            'body_multiloc' => c.body_multiloc,
            'created_at' => c.created_at.to_s,
            'updated_at' => c.updated_at.to_s,
            'text_images_attributes' => c.text_images.map do |ti|
              {
                'imageable_field' => ti.imageable_field,
                'remote_image_url' => ti.image_url,
                'text_reference' => ti.text_reference,
                'created_at' => ti.created_at.to_s,
                'updated_at' => ti.updated_at.to_s
              }
            end
          }
          store_ref yml_campaign, c.id, :email_campaign
          yml_campaign
        end
      end

      def yml_unsubscription_tokens
        EmailCampaigns::UnsubscriptionToken.all.filter_map do |ut|
          user_ref = lookup_ref(ut.user_id, :user)
          next unless user_ref # only add tokens for users we include in template

          {
            'user_ref' => user_ref,
            'token' => ut.token
          }
        end
      end

      def yml_baskets
        Basket.all.map do |b|
          yml_basket = {
            'submitted_at' => b.submitted_at.to_s,
            'user_ref' => lookup_ref(b.user_id, :user),
            'participation_context_ref' => lookup_ref(b.participation_context_id, %i[project phase]),
            'created_at' => b.created_at.to_s,
            'updated_at' => b.updated_at.to_s
          }
          store_ref yml_basket, b.id, :basket
          yml_basket
        end
      end

      def yml_events
        Event.all.map do |e|
          yml_event = {
            'project_ref' => lookup_ref(e.project_id, :project),
            'title_multiloc' => e.title_multiloc,
            'description_multiloc' => e.description_multiloc,
            'location_multiloc' => e.location_multiloc,
            'start_at' => e.start_at.to_s,
            'end_at' => e.end_at.to_s,
            'created_at' => e.created_at.to_s,
            'updated_at' => e.updated_at.to_s,
            'text_images_attributes' => e.text_images.map do |ti|
              {
                'imageable_field' => ti.imageable_field,
                'remote_image_url' => ti.image_url,
                'text_reference' => ti.text_reference,
                'created_at' => ti.created_at.to_s,
                'updated_at' => ti.updated_at.to_s
              }
            end
          }
          store_ref yml_event, e.id, :event
          yml_event
        end
      end

      def yml_event_files
        EventFile.all.map do |e|
          {
            'event_ref' => lookup_ref(e.event_id, :event),
            'name' => e.name,
            'ordering' => e.ordering,
            'remote_file_url' => e.file_url,
            'created_at' => e.created_at.to_s,
            'updated_at' => e.updated_at.to_s
          }
        end
      end

      def yml_groups
        Group.where(membership_type: 'manual').map do |g|
          yml_group = {
            'title_multiloc' => g.title_multiloc,
            'created_at' => g.created_at.to_s,
            'updated_at' => g.updated_at.to_s,
            'membership_type' => g.membership_type,
            'rules' => g.rules
          }
          store_ref yml_group, g.id, :group
          yml_group
        end
      end

      def yml_groups_projects
        GroupsProject.where(group_id: Group.where(membership_type: 'manual').ids).map do |g|
          {
            'group_ref' => lookup_ref(g.group_id, :group),
            'project_ref' => lookup_ref(g.project_id, :project),
            'created_at' => g.created_at.to_s,
            'updated_at' => g.updated_at.to_s
          }
        end
      end

      def yml_permissions
        Permission.all.map do |p|
          yml_permission = {
            'action' => p.action,
            'permitted_by' => p.permitted_by,
            'permission_scope_ref' => lookup_ref(p.permission_scope_id, %i[project phase]),
            'created_at' => p.created_at.to_s,
            'updated_at' => p.updated_at.to_s
          }
          store_ref yml_permission, p.id, :permission
          yml_permission
        end
      end

      def yml_groups_permissions
        GroupsPermission.where(group_id: Group.where(membership_type: 'manual').ids).map do |g|
          {
            'permission_ref' => lookup_ref(g.permission_id, :permission),
            'group_ref' => lookup_ref(g.group_id, :group),
            'created_at' => g.created_at.to_s,
            'updated_at' => g.updated_at.to_s
          }
        end
      end

      def yml_memberships
        Membership.all.filter_map do |m|
          user = lookup_ref(m.user_id, :user)
          next unless user

          {
            'group_ref' => lookup_ref(m.group_id, :group),
            'user_ref' => user,
            'created_at' => m.created_at.to_s,
            'updated_at' => m.updated_at.to_s
          }
        end
      end

      def yml_static_pages
        StaticPage.all.map do |sp|
          yml_page = {
            'title_multiloc' => sp.title_multiloc,
            'top_info_section_multiloc' => sp.top_info_section_multiloc,
            'slug' => sp.slug,
            'created_at' => sp.created_at.to_s,
            'updated_at' => sp.updated_at.to_s,
            'code' => sp.code,
            'banner_enabled' => sp.banner_enabled,
            'banner_layout' => sp.banner_layout,
            'banner_overlay_color' => sp.banner_overlay_color,
            'banner_overlay_opacity' => sp.banner_overlay_opacity,
            'banner_cta_button_multiloc' => sp.banner_cta_button_multiloc,
            'banner_cta_button_type' => sp.banner_cta_button_type,
            'banner_cta_button_url' => sp.banner_cta_button_url,
            'banner_header_multiloc' => sp.banner_header_multiloc,
            'banner_subheader_multiloc' => sp.banner_subheader_multiloc,
            'top_info_section_enabled' => sp.top_info_section_enabled,
            'files_section_enabled' => sp.files_section_enabled,
            'projects_enabled' => sp.projects_enabled,
            'projects_filter_type' => sp.projects_filter_type,
            'events_widget_enabled' => sp.events_widget_enabled,
            'bottom_info_section_enabled' => sp.bottom_info_section_enabled,
            'bottom_info_section_multiloc' => sp.bottom_info_section_multiloc,
            'remote_header_bg_url' => sp.header_bg_url,
            'text_images_attributes' => sp.text_images.map do |ti|
              {
                'imageable_field' => ti.imageable_field,
                'remote_image_url' => ti.image_url,
                'text_reference' => ti.text_reference,
                'created_at' => ti.created_at.to_s,
                'updated_at' => ti.updated_at.to_s
              }
            end
          }
          store_ref yml_page, sp.id, :static_page
          yml_page
        end
      end

      def yml_nav_bar_items
        NavBarItem.all.map do |n|
          {
            'code' => n.code,
            'title_multiloc' => n.title_multiloc,
            'ordering' => n.ordering,
            'static_page_ref' => lookup_ref(n.static_page_id, :static_page),
            'created_at' => n.created_at.to_s,
            'updated_at' => n.updated_at.to_s
          }
        end
      end

      def yml_static_page_files
        StaticPageFile.all.map do |p|
          {
            'static_page_ref' => lookup_ref(p.static_page_id, :static_page),
            'ordering' => p.ordering,
            'name' => p.name,
            'remote_file_url' => p.file_url,
            'created_at' => p.created_at.to_s,
            'updated_at' => p.updated_at.to_s
          }
        end
      end

      def yml_idea_statuses
        IdeaStatus.all.map do |i|
          yml_idea_status = {
            'title_multiloc' => i.title_multiloc,
            'ordering' => i.ordering,
            'code' => i.code,
            'color' => i.color,
            'created_at' => i.created_at.to_s,
            'updated_at' => i.updated_at.to_s,
            'description_multiloc' => i.description_multiloc
          }
          store_ref yml_idea_status, i.id, :idea_status
          yml_idea_status
        end
      end

      def yml_ideas
        Idea.published.map do |idea|
          yml_idea = {
            'title_multiloc' => idea.title_multiloc,
            'body_multiloc' => idea.body_multiloc,
            'publication_status' => idea.publication_status,
            'published_at' => idea.published_at.to_s,
            'project_ref' => lookup_ref(idea.project_id, :project),
            'author_ref' => lookup_ref(idea.author_id, :user),
            'created_at' => idea.created_at.to_s,
            'updated_at' => idea.updated_at.to_s,
            'location_point_geojson' => idea.location_point_geojson,
            'location_description' => idea.location_description,
            'idea_status_ref' => lookup_ref(idea.idea_status_id, :idea_status),
            'budget' => idea.budget,
            'proposed_budget' => idea.proposed_budget,
            'text_images_attributes' => idea.text_images.map do |img|
              {
                'imageable_field' => img.imageable_field,
                'remote_image_url' => img.image_url,
                'text_reference' => img.text_reference,
                'created_at' => img.created_at.to_s,
                'updated_at' => img.updated_at.to_s
              }
            end,
            'creation_phase_ref' => lookup_ref(idea.creation_phase_id, :phase)
          }
          custom_fields = CustomField.where(
            resource: CustomForm.where(participation_context_id: [idea.project_id, idea.creation_phase_id].compact)
          )
          yml_idea['custom_field_values'] = filter_custom_field_values(idea.custom_field_values, custom_fields) if custom_fields
          store_ref yml_idea, idea.id, :idea
          yml_idea
        end
      end

      def yml_baskets_ideas
        BasketsIdea.where(idea: Idea.published).map do |b|
          if lookup_ref(b.idea_id, :idea)
            {
              'basket_ref' => lookup_ref(b.basket_id, :basket),
              'idea_ref' => lookup_ref(b.idea_id, :idea)
            }
          end.compact
        end
      end

      def yml_idea_files
        IdeaFile.where(idea: Idea.published).map do |i|
          {
            'idea_ref' => lookup_ref(i.idea_id, :idea),
            'name' => i.name,
            'remote_file_url' => i.file_url,
            'ordering' => i.ordering,
            'created_at' => i.created_at.to_s,
            'updated_at' => i.updated_at.to_s
          }
        end
      end

      def yml_idea_images
        IdeaImage.where(idea: Idea.published).map do |i|
          {
            'idea_ref' => lookup_ref(i.idea_id, :idea),
            'remote_image_url' => i.image_url,
            'ordering' => i.ordering,
            'created_at' => i.created_at.to_s,
            'updated_at' => i.updated_at.to_s
          }
        end
      end

      def yml_ideas_phases
        IdeasPhase.where(idea: Idea.published).map do |i|
          {
            'idea_ref' => lookup_ref(i.idea_id, :idea),
            'phase_ref' => lookup_ref(i.phase_id, :phase),
            'created_at' => i.created_at.to_s,
            'updated_at' => i.updated_at.to_s
          }
        end
      end

      def yml_ideas_topics
        IdeasTopic.where(idea: Idea.published).map do |i|
          {
            'idea_ref' => lookup_ref(i.idea_id, :idea),
            'topic_ref' => lookup_ref(i.topic_id, :topic)
          }
        end
      end

      def yml_initiative_statuses
        InitiativeStatus.all.map do |i|
          yml_initiative_status = {
            'title_multiloc' => i.title_multiloc,
            'ordering' => i.ordering,
            'code' => i.code,
            'color' => i.color,
            'created_at' => i.created_at.to_s,
            'updated_at' => i.updated_at.to_s,
            'description_multiloc' => i.description_multiloc
          }
          store_ref yml_initiative_status, i.id, :initiative_status
          yml_initiative_status
        end
      end

      def yml_initiatives
        Initiative.published.map do |i|
          yml_initiative = {
            'title_multiloc' => i.title_multiloc,
            'body_multiloc' => i.body_multiloc,
            'publication_status' => i.publication_status,
            'published_at' => i.published_at.to_s,
            'author_ref' => lookup_ref(i.author_id, :user),
            'created_at' => i.created_at.to_s,
            'updated_at' => i.updated_at.to_s,
            'location_point_geojson' => i.location_point_geojson,
            'location_description' => i.location_description,
            'text_images_attributes' => i.text_images.map do |ti|
              {
                'imageable_field' => ti.imageable_field,
                'remote_image_url' => ti.image_url,
                'text_reference' => ti.text_reference,
                'created_at' => ti.created_at.to_s,
                'updated_at' => ti.updated_at.to_s
              }
            end
          }
          store_ref yml_initiative, i.id, :initiative
          yml_initiative
        end
      end

      def yml_initiative_status_changes
        InitiativeStatusChange.where(initiative: Initiative.published).map do |i|
          {
            'created_at' => i.created_at.to_s,
            'updated_at' => i.updated_at.to_s,
            'initiative_ref' => lookup_ref(i.initiative_id, :initiative),
            'initiative_status_ref' => lookup_ref(i.initiative_status_id, :initiative_status)
          }
        end
      end

      def yml_areas_initiatives
        AreasInitiative.where(initiative: Initiative.published).filter_map do |a|
          next unless lookup_ref(a.initiative_id, :initiative)

          {
            'area_ref' => lookup_ref(a.area_id, :area),
            'initiative_ref' => lookup_ref(a.initiative_id, :initiative)
          }
        end
      end

      def yml_initiative_files
        InitiativeFile.where(initiative: Initiative.published).map do |i|
          {
            'initiative_ref' => lookup_ref(i.initiative_id, :initiative),
            'name' => i.name,
            'remote_file_url' => i.file_url,
            'ordering' => i.ordering,
            'created_at' => i.created_at.to_s,
            'updated_at' => i.updated_at.to_s
          }
        end
      end

      def yml_initiative_images
        InitiativeImage.where(initiative: Initiative.published).map do |i|
          {
            'initiative_ref' => lookup_ref(i.initiative_id, :initiative),
            'remote_image_url' => i.image_url,
            'ordering' => i.ordering,
            'created_at' => i.created_at.to_s,
            'updated_at' => i.updated_at.to_s
          }
        end
      end

      def yml_initiatives_topics
        InitiativesTopic.where(initiative: Initiative.published).map do |i|
          {
            'initiative_ref' => lookup_ref(i.initiative_id, :initiative),
            'topic_ref' => lookup_ref(i.topic_id, :topic)
          }
        end
      end

      def yml_official_feedback
        OfficialFeedback.where(post_id: (Idea.published.ids + Initiative.published.ids)).map do |a|
          yml_official_feedback = {
            'user_ref' => lookup_ref(a.user_id, :user),
            'post_ref' => lookup_ref(a.post_id, %i[idea initiative]),
            'body_multiloc' => a.body_multiloc,
            'author_multiloc' => a.author_multiloc,
            'created_at' => a.created_at.to_s,
            'updated_at' => a.updated_at.to_s
          }
          store_ref yml_official_feedback, a.id, :admin_feedback
          yml_official_feedback
        end
      end

      def yml_comments
        comments = Comment.where(post_id: (Idea.published.ids + Initiative.published.ids))
        (comments.where(parent_id: nil) + comments.where.not(parent_id: nil)).map do |c|
          yml_comment = {
            'author_ref' => lookup_ref(c.author_id, :user),
            'post_ref' => lookup_ref(c.post_id, %i[idea initiative]),
            'body_multiloc' => c.body_multiloc,
            'created_at' => c.created_at.to_s,
            'updated_at' => c.updated_at.to_s,
            'publication_status' => c.publication_status,
            'body_updated_at' => c.body_updated_at.to_s
          }
          yml_comment['parent_ref'] = lookup_ref(c.parent_id, :comment) if c.parent_id
          store_ref yml_comment, c.id, :comment
          yml_comment
        end
      end

      def yml_votes
        idea_or_initiative_ids = Idea.published.ids + Initiative.published.ids
        Vote.where.not(user_id: nil).where(votable: (idea_or_initiative_ids + Comment.where(post: idea_or_initiative_ids))).map do |v|
          yml_vote = {
            'votable_ref' => lookup_ref(v.votable_id, %i[idea initiative comment]),
            'user_ref' => lookup_ref(v.user_id, :user),
            'mode' => v.mode,
            'created_at' => v.created_at.to_s,
            'updated_at' => v.updated_at.to_s
          }
          store_ref yml_vote, v.id, :vote
          yml_vote
        end
      end

      def yml_poll_questions
        Polls::Question.all.map do |q|
          yml_question = {
            'participation_context_ref' => lookup_ref(q.participation_context_id, %i[project phase]),
            'title_multiloc' => q.title_multiloc,
            'ordering' => q.ordering,
            'created_at' => q.created_at.to_s,
            'updated_at' => q.updated_at.to_s,
            'question_type' => q.question_type,
            'max_options' => q.max_options
          }
          store_ref yml_question, q.id, :poll_question
          yml_question
        end
      end

      def yml_poll_options
        Polls::Option.all.map do |o|
          yml_option = {
            'question_ref' => lookup_ref(o.question_id, [:poll_question]),
            'title_multiloc' => o.title_multiloc,
            'ordering' => o.ordering,
            'created_at' => o.created_at.to_s,
            'updated_at' => o.updated_at.to_s
          }
          store_ref yml_option, o.id, :poll_option
          yml_option
        end
      end

      def yml_poll_responses
        Polls::Response.all.map do |r|
          yml_response = {
            'participation_context_ref' => lookup_ref(r.participation_context_id, %i[project phase]),
            'user_ref' => lookup_ref(r.user_id, :user),
            'created_at' => r.created_at.to_s,
            'updated_at' => r.updated_at.to_s
          }
          store_ref yml_response, r.id, :poll_response
          yml_response
        end
      end

      def yml_poll_response_options
        Polls::ResponseOption.all.map do |r|
          yml_response_option = {
            'response_ref' => lookup_ref(r.response_id, :poll_response),
            'option_ref' => lookup_ref(r.option_id, :poll_option),
            'created_at' => r.created_at.to_s,
            'updated_at' => r.updated_at.to_s
          }
          store_ref yml_response_option, r.id, :poll_response_option
          yml_response_option
        end
      end

      def yml_volunteering_causes
        Volunteering::Cause.all.map do |c|
          yml_cause = {
            'participation_context_ref' => lookup_ref(c.participation_context_id, %i[project phase]),
            'title_multiloc' => c.title_multiloc,
            'description_multiloc' => c.description_multiloc,
            'remote_image_url' => c.image_url,
            'ordering' => c.ordering,
            'created_at' => c.created_at.to_s,
            'updated_at' => c.updated_at.to_s
          }
          store_ref yml_cause, c.id, :volunteering_cause
          yml_cause
        end
      end

      def yml_volunteering_volunteers
        Volunteering::Volunteer.all.map do |v|
          yml_volunteer = {
            'cause_ref' => lookup_ref(v.cause_id, [:volunteering_cause]),
            'user_ref' => lookup_ref(v.user_id, :user),
            'created_at' => v.created_at.to_s,
            'updated_at' => v.updated_at.to_s
          }
          store_ref yml_volunteer, v.id, :volunteering_volunteer
          yml_volunteer
        end
      end

      def yml_maps_map_configs
        CustomMaps::MapConfig.all.map do |map_config|
          yml_map_config = {
            'project_ref' => lookup_ref(map_config.project_id, :project),
            'center_geojson' => map_config.center_geojson,
            'zoom_level' => map_config.zoom_level&.to_f,
            'tile_provider' => map_config.tile_provider,
            'created_at' => map_config.created_at.to_s,
            'updated_at' => map_config.updated_at.to_s
          }
          store_ref yml_map_config, map_config.id, :maps_map_config
          yml_map_config
        end
      end

      def yml_maps_layers
        CustomMaps::Layer.all.map do |layer|
          yml_layer = {
            'map_config_ref' => lookup_ref(layer.map_config_id, :maps_map_config),
            'title_multiloc' => layer.title_multiloc,
            'geojson' => layer.geojson,
            'default_enabled' => layer.default_enabled,
            'marker_svg_url' => layer.marker_svg_url,
            'created_at' => layer.created_at.to_s,
            'updated_at' => layer.updated_at.to_s
          }
          yml_layer
        end
      end

      def yml_maps_legend_items
        CustomMaps::LegendItem.all.map do |legend_item|
          {
            'map_config_ref' => lookup_ref(legend_item.map_config_id, :maps_map_config),
            'title_multiloc' => legend_item.title_multiloc,
            'color' => legend_item.color,
            'ordering' => legend_item.ordering,
            'created_at' => legend_item.created_at.to_s,
            'updated_at' => legend_item.updated_at.to_s
          }
        end
      end
    end
  end
end
