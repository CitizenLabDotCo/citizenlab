class MultiTenancy::Templates::Serializer
  def initialize(tenant)
    @tenant = tenant
    @refs = {}
  end

  def run
    template = { 'models' => {} }
    Apartment::Tenant.switch(@tenant.schema_name) do
      template['models']['area']                                 = yml_areas
      template['models']['custom_form']                          = yml_custom_forms
      template['models']['custom_field']                         = yml_custom_fields
      template['models']['custom_field_option']                  = yml_custom_field_options
      template['models']['topic']                                = yml_topics
      template['models']['user']                                 = yml_users
      template['models']['email_campaigns/unsubscription_token'] = yml_unsubscription_tokens
      template['models']['project_folders/folder']               = yml_project_folders
      template['models']['project_folders/image']                = yml_project_folder_images
      template['models']['project_folders/file']                 = yml_project_folder_files
      template['models']['project']                              = yml_projects
      template['models']['project_file']                         = yml_project_files
      template['models']['project_image']                        = yml_project_images
      template['models']['projects_allowed_input_topic']         = yml_projects_allowed_input_topics
      template['models']['phase']                                = yml_phases
      template['models']['phase_file']                           = yml_phase_files
      template['models']['areas_project']                        = yml_areas_projects
      template['models']['email_campaigns/campaigns']            = yml_campaigns
      template['models']['basket']                               = yml_baskets
      template['models']['event']                                = yml_events
      template['models']['event_file']                           = yml_event_files
      template['models']['group']                                = yml_groups
      template['models']['groups_project']                       = yml_groups_projects
      template['models']['permission']                           = yml_permissions
      template['models']['groups_permission']                    = yml_groups_permissions
      template['models']['membership']                           = yml_memberships
      template['models']['static_page']                          = yml_static_pages
      template['models']['nav_bar_items']                        = yml_nav_bar_items
      template['models']['static_page_file']                     = yml_static_page_files
      template['models']['idea_status']                          = yml_idea_statuses
      template['models']['idea']                                 = yml_ideas
      template['models']['areas_idea']                           = yml_areas_ideas
      template['models']['baskets_idea']                         = yml_baskets_ideas
      template['models']['idea_file']                            = yml_idea_files
      template['models']['idea_image']                           = yml_idea_images
      template['models']['ideas_phase']                          = yml_ideas_phases
      template['models']['ideas_topic']                          = yml_ideas_topics
      template['models']['initiative_status']                    = yml_initiative_statuses
      template['models']['initiative']                           = yml_initiatives
      template['models']['areas_initiative']                     = yml_areas_initiatives
      template['models']['initiative_file']                      = yml_initiative_files
      template['models']['initiative_image']                     = yml_initiative_images
      template['models']['initiatives_topic']                    = yml_initiatives_topics
      template['models']['official_feedback']                    = yml_official_feedback
      template['models']['comment']                              = yml_comments
      template['models']['vote']                                 = yml_votes
      template['models']['polls/question']                       = yml_poll_questions
      template['models']['polls/option']                         = yml_poll_options
      template['models']['polls/response']                       = yml_poll_responses
      template['models']['polls/response_option']                = yml_poll_response_options
      template['models']['volunteering/cause']                   = yml_volunteering_causes
      template['models']['volunteering/volunteer']               = yml_volunteering_volunteers
      template['models']['custom_maps/map_config']               = yml_maps_map_configs
      template['models']['custom_maps/layer']                    = yml_maps_layers
      template['models']['custom_maps/legend_item']              = yml_maps_legend_items
    end
    template
  end

  private

  def lookup_ref id, model_name
    return nil if !id
    if model_name.kind_of?(Array)
      model_name.each do |n|
        return @refs.dig(n, id) if @refs.dig(n, id)
      end
      return nil
    else
      @refs[model_name][id]
    end
  end

  def store_ref yml_obj, id, model_name
    @refs[model_name] ||= {}
    @refs[model_name][id] = yml_obj
  end

  def yml_areas
    Area.all.map do |a|
      yml_area = {
        'title_multiloc'       => a.title_multiloc,
        'description_multiloc' => a.description_multiloc,
        'created_at'           => a.created_at.to_s,
        'updated_at'           => a.updated_at.to_s,
        'ordering'             => a.ordering
      }
      store_ref yml_area, a.id, :area
      yml_area
    end
  end

  def yml_custom_forms
    CustomForm.all.map do |c|
      yml_custom_form = {
        'created_at'           => c.created_at.to_s,
        'updated_at'           => c.updated_at.to_s,
      }
      store_ref yml_custom_form, c.id, :custom_form
      yml_custom_form
    end
  end

  def yml_custom_fields
    CustomField.all.map do |c|
      yml_custom_field = {
        'resource_ref'         => c.resource_id && lookup_ref(c.resource_id, :custom_form),
        'key'                  => c.key,
        'input_type'           => c.input_type,
        'title_multiloc'       => c.title_multiloc,
        'description_multiloc' => c.description_multiloc,
        'ordering'             => c.ordering,
        'created_at'           => c.created_at.to_s,
        'updated_at'           => c.updated_at.to_s,
        'enabled'              => c.enabled,
        'code'                 => c.code
      }
      if c.resource_type == User.name
        yml_custom_field['resource_type'] = c.resource_type
        # No user custom fields are required anymore because
        # the user choices cannot be remembered.
      else
        yml_custom_field['resource_ref'] = c.resource_id && lookup_ref(c.resource_id, :custom_form)
        yml_custom_field['required'] = c.required
      end
      store_ref yml_custom_field, c.id, :custom_field
      yml_custom_field
    end
  end

  def yml_custom_field_options
    CustomFieldOption.all.map do |c|
      yml_custom_field_option = {
        'custom_field_ref'     => lookup_ref(c.custom_field_id, :custom_field),
        'key'                  => c.key,
        'title_multiloc'       => c.title_multiloc,
        'ordering'             => c.ordering,
        'created_at'           => c.created_at.to_s,
        'updated_at'           => c.updated_at.to_s
      }
      store_ref yml_custom_field_option, c.id, :custom_field_option
      yml_custom_field_option
    end
  end

  def yml_topics
    Topic.all.map do |t|
      yml_topic = {
        'title_multiloc'       => t.title_multiloc,
        'description_multiloc' => t.description_multiloc,
        'icon'                 => t.icon,
        'ordering'             => t.ordering,
        'code'                 => t.code,
        'created_at'           => t.created_at.to_s,
        'updated_at'           => t.updated_at.to_s
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

    # TODO properly copy project moderator roles and domicile
    User.where("invite_status IS NULL or invite_status != ?", 'pending').map do |u|
      yml_user = {
        'email'                     => u.email,
        'password_digest'           => u.password_digest,
        'created_at'                => u.created_at.to_s,
        'updated_at'                => u.updated_at.to_s,
        'remote_avatar_url'         => u.avatar_url,
        'first_name'                => u.first_name,
        'last_name'                 => u.last_name,
        'locale'                    => u.locale,
        'bio_multiloc'              => u.bio_multiloc,
        'cl1_migrated'              => u.cl1_migrated,
        'custom_field_values'       => u.custom_field_values.delete_if{|k,v| v.nil? || (k == 'domicile')},
        'registration_completed_at' => u.registration_completed_at.to_s,
        'verified'                  => u.verified,
      }
      if !yml_user['password_digest']
        yml_user['password'] = SecureRandom.urlsafe_base64 32
      end
      store_ref yml_user, u.id, :user
      yml_user
    end
  end

  def yml_project_folders
    ProjectFolders::Folder.all.map do |f|
      yml_folder = {
        'title_multiloc'               => f.title_multiloc,
        'description_multiloc'         => f.description_multiloc,
        'remote_header_bg_url'         => f.header_bg_url,
        'description_preview_multiloc' => f.description_preview_multiloc,
        'created_at'                   => f.created_at.to_s,
        'updated_at'                   => f.updated_at.to_s,
        'admin_publication_attributes' => {
          'publication_status'         => f.admin_publication.publication_status,
          'ordering'                   => f.admin_publication.ordering
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
        'remote_image_url'   => p.image_url,
        'ordering'           => p.ordering,
        'created_at'         => p.created_at.to_s,
        'updated_at'         => p.updated_at.to_s
      }
    end
  end

  def yml_project_folder_files
    ProjectFolders::File.all.map do |p|
      {
        'project_folder_ref' => lookup_ref(p.project_folder_id, :project_folder),
        'name'               => p.name,
        'ordering'           => p.ordering,
        'remote_file_url'    => p.file_url,
        'created_at'         => p.created_at.to_s,
        'updated_at'         => p.updated_at.to_s
      }
    end
  end

  def yml_projects
    Project.all.map do |p|
      yml_project = yml_participation_context p
      yml_project.merge!({
        'title_multiloc'               => p.title_multiloc,
        'description_multiloc'         => p.description_multiloc,
        'created_at'                   => p.created_at.to_s,
        'updated_at'                   => p.updated_at.to_s,
        'remote_header_bg_url'         => p.header_bg_url,
        'visible_to'                   => p.visible_to,
        'ideas_order'                  => p.ideas_order,
        'input_term'                   => p.input_term,
        'description_preview_multiloc' => p.description_preview_multiloc,
        'process_type'                 => p.process_type,
        'internal_role'                => p.internal_role,
        'custom_form_ref'              => lookup_ref(p.custom_form_id, :custom_form),
        'admin_publication_attributes' => {
          'publication_status'         => p.admin_publication.publication_status,
          'ordering'                   => p.admin_publication.ordering,
          'parent_ref'                 => lookup_ref(p.admin_publication.parent_id, :admin_publication_attributes)
        },
        'text_images_attributes'       => p.text_images.map{ |ti|
          {
            'imageable_field'          => ti.imageable_field,
            'remote_image_url'         => ti.image_url,
            'text_reference'           => ti.text_reference,
            'created_at'               => ti.created_at.to_s,
            'updated_at'               => ti.updated_at.to_s
          }
        }
      })
      store_ref yml_project, p.id, :project
      yml_project
    end
  end

  def yml_project_files
    ProjectFile.all.map do |p|
      {
        'project_ref'     => lookup_ref(p.project_id, :project),
        'name'            => p.name,
        'ordering'        => p.ordering,
        'remote_file_url' => p.file_url,
        'created_at'      => p.created_at.to_s,
        'updated_at'      => p.updated_at.to_s
      }
    end
  end

  def yml_project_images
    ProjectImage.all.map do |p|
      {
        'project_ref'      => lookup_ref(p.project_id, :project),
        'remote_image_url' => p.image_url,
        'ordering'         => p.ordering,
        'created_at'       => p.created_at.to_s,
        'updated_at'       => p.updated_at.to_s
      }
    end
  end

  def yml_projects_allowed_input_topics
    ProjectsAllowedInputTopic.all.map do |p|
      {
        'project_ref' => lookup_ref(p.project_id, :project),
        'topic_ref'   => lookup_ref(p.topic_id, :topic),
        'ordering'    => p.ordering,
        'created_at'  => p.created_at.to_s,
        'updated_at'  => p.updated_at.to_s
      }
    end
  end

  def yml_phases
    Phase.all.map do |p|
      yml_phase = yml_participation_context p
      yml_phase.merge!({
        'project_ref'            => lookup_ref(p.project_id, :project),
        'title_multiloc'         => p.title_multiloc,
        'description_multiloc'   => p.description_multiloc,
        'start_at'               => p.start_at.to_s,
        'end_at'                 => p.end_at.to_s,
        'ideas_order'            => p.ideas_order,
        'input_term'             => p.input_term,
        'created_at'             => p.created_at.to_s,
        'updated_at'             => p.updated_at.to_s,
        'text_images_attributes' => p.text_images.map{ |ti|
          {
            'imageable_field'    => ti.imageable_field,
            'remote_image_url'   => ti.image_url,
            'text_reference'     => ti.text_reference,
            'created_at'         => ti.created_at.to_s,
            'updated_at'         => ti.updated_at.to_s
          }
        }
      })
      store_ref yml_phase, p.id, :phase
      yml_phase
    end
  end

  def yml_phase_files
    PhaseFile.all.map do |p|
      {
        'phase_ref'       => lookup_ref(p.phase_id, :phase),
        'name'            => p.name,
        'ordering'        => p.ordering,
        'remote_file_url' => p.file_url,
        'created_at'      => p.created_at.to_s,
        'updated_at'      => p.updated_at.to_s
      }
    end
  end

  def yml_participation_context pc
    yml_pc = {
      'presentation_mode'            => pc.presentation_mode,
      'participation_method'         => pc.participation_method,
      'posting_enabled'              => pc.posting_enabled,
      'commenting_enabled'           => pc.commenting_enabled,
      'voting_enabled'               => pc.voting_enabled,
      'upvoting_method'              => pc.upvoting_method,
      'upvoting_limited_max'         => pc.upvoting_limited_max,
      'downvoting_enabled'           => pc.downvoting_enabled,
      'downvoting_method'            => pc.downvoting_method,
      'downvoting_limited_max'       => pc.downvoting_limited_max,
      'max_budget'                   => pc.max_budget
    }
    if yml_pc['participation_method'] == 'survey'
      yml_pc.merge!({
        'survey_embed_url' => pc.survey_embed_url,
        'survey_service'   => pc.survey_service
      })
    end
    yml_pc
  end

  def yml_areas_projects
    AreasProject.all.map do |a|
      {
        'area_ref'    => lookup_ref(a.area_id, :area),
        'project_ref' => lookup_ref(a.project_id, :project)
      }
    end
  end

  def yml_campaigns
    EmailCampaigns::Campaign.where(type: "EmailCampaigns::Campaigns::Manual").map do |c|
      yml_campaign = {
        'type'                   => c.type,
        'author_ref'             => lookup_ref(c.author_id, :user),
        'enabled'                => c.enabled,
        'sender'                 => c.sender,
        'subject_multiloc'       => c.subject_multiloc,
        'body_multiloc'          => c.body_multiloc,
        'created_at'             => c.created_at.to_s,
        'updated_at'             => c.updated_at.to_s,
        'text_images_attributes' => c.text_images.map{ |ti|
          {
            'imageable_field'    => ti.imageable_field,
            'remote_image_url'   => ti.image_url,
            'text_reference'     => ti.text_reference,
            'created_at'         => ti.created_at.to_s,
            'updated_at'         => ti.updated_at.to_s
          }
        }
      }
      store_ref yml_campaign, c.id, :email_campaign
      yml_campaign
    end
  end

  def yml_unsubscription_tokens
    EmailCampaigns::UnsubscriptionToken.all.map do |ut|
      user_ref = lookup_ref(ut.user_id, :user)
      if user_ref # only add tokens for users we include in template
        {
          'user_ref'        => user_ref,
          'token'           => ut.token
        }
      end
    end.compact
  end

  def yml_baskets
    Basket.all.map do |b|
      yml_basket = {
        'submitted_at'              => b.submitted_at.to_s,
        'user_ref'                  => lookup_ref(b.user_id, :user),
        'participation_context_ref' => lookup_ref(b.participation_context_id, [:project, :phase]),
        'created_at'                => b.created_at.to_s,
        'updated_at'                => b.updated_at.to_s,
      }
      store_ref yml_basket, b.id, :basket
      yml_basket
    end
  end

  def yml_events
    Event.all.map do |e|
      yml_event = {
        'project_ref'            => lookup_ref(e.project_id, :project),
        'title_multiloc'         => e.title_multiloc,
        'description_multiloc'   => e.description_multiloc,
        'location_multiloc'      => e.location_multiloc,
        'start_at'               => e.start_at.to_s,
        'end_at'                 => e.end_at.to_s,
        'created_at'             => e.created_at.to_s,
        'updated_at'             => e.updated_at.to_s,
        'text_images_attributes' => e.text_images.map{ |ti|
          {
            'imageable_field'    => ti.imageable_field,
            'remote_image_url'   => ti.image_url,
            'text_reference'     => ti.text_reference,
            'created_at'         => ti.created_at.to_s,
            'updated_at'         => ti.updated_at.to_s
          }
        }
      }
      store_ref yml_event, e.id, :event
      yml_event
    end
  end

  def yml_event_files
    EventFile.all.map do |e|
      {
        'event_ref'       => lookup_ref(e.event_id, :event),
        'name'            => e.name,
        'ordering'        => e.ordering,
        'remote_file_url' => e.file_url,
        'created_at'      => e.created_at.to_s,
        'updated_at'      => e.updated_at.to_s
      }
    end
  end

  def yml_groups
    Group.where(membership_type: 'manual').map do |g|
      yml_group = {
        'title_multiloc'  => g.title_multiloc,
        'created_at'      => g.created_at.to_s,
        'updated_at'      => g.updated_at.to_s,
        'membership_type' => g.membership_type,
        'rules'           => g.rules
      }
      store_ref yml_group, g.id, :group
      yml_group
    end
  end

  def yml_groups_projects
    GroupsProject.where(group_id: Group.where(membership_type: 'manual').ids).map do |g|
      {
        'group_ref'   => lookup_ref(g.group_id, :group),
        'project_ref' => lookup_ref(g.project_id, :project),
        'created_at'  => g.created_at.to_s,
        'updated_at'  => g.updated_at.to_s
      }
    end
  end

  def yml_permissions
    Permission.all.map do |p|
      yml_permission = {
        'action'          => p.action,
        'permitted_by'    => p.permitted_by,
        'permission_scope_ref' => lookup_ref(p.permission_scope_id, [:project, :phase]),
        'created_at'      => p.created_at.to_s,
        'updated_at'      => p.updated_at.to_s
      }
      store_ref yml_permission, p.id, :permission
      yml_permission
    end
  end

  def yml_groups_permissions
    GroupsPermission.where(group_id: Group.where(membership_type: 'manual').ids).map do |g|
      {
        'permission_ref' => lookup_ref(g.permission_id, :permission),
        'group_ref'      => lookup_ref(g.group_id, :group),
        'created_at'     => g.created_at.to_s,
        'updated_at'     => g.updated_at.to_s
      }
    end
  end

  def yml_memberships
    Membership.all.map do |m|
      user = lookup_ref(m.user_id, :user)
      if user
        {
          'group_ref'  => lookup_ref(m.group_id, :group),
          'user_ref'   => user,
          'created_at' => m.created_at.to_s,
          'updated_at' => m.updated_at.to_s
        }
      end
    end.compact
  end

  def yml_static_pages
    StaticPage.all.map do |p|
      yml_page = {
        'title_multiloc'         => p.title_multiloc,
        'body_multiloc'          => p.body_multiloc,
        'slug'                   => p.slug,
        'created_at'             => p.created_at.to_s,
        'updated_at'             => p.updated_at.to_s,
        'text_images_attributes' => p.text_images.map{ |ti|
          {
            'imageable_field'    => ti.imageable_field,
            'remote_image_url'   => ti.image_url,
            'text_reference'     => ti.text_reference,
            'created_at'         => ti.created_at.to_s,
            'updated_at'         => ti.updated_at.to_s
          }
        }
      }
      store_ref yml_page, p.id, :static_page
      yml_page
    end
  end

  def yml_nav_bar_items
    NavBarItem.all.map do |n|
      {
        'code'            => n.code,
        'title_multiloc'  => n.title_multiloc,
        'ordering'        => n.ordering,
        'static_page_ref' => lookup_ref(n.static_page_id, :static_page),
        'created_at'      => n.created_at.to_s,
        'updated_at'      => n.updated_at.to_s
      }
    end
  end

  def yml_static_page_files
    StaticPageFile.all.map do |p|
      {
        'static_page_ref' => lookup_ref(p.static_page_id, :static_page),
        'ordering'        => p.ordering,
        'name'            => p.name,
        'remote_file_url' => p.file_url,
        'created_at'      => p.created_at.to_s,
        'updated_at'      => p.updated_at.to_s
      }
    end
  end

  def yml_idea_statuses
    IdeaStatus.all.map do |i|
      yml_idea_status = {
        'title_multiloc'       => i.title_multiloc,
        'ordering'             => i.ordering,
        'code'                 => i.code,
        'color'                => i.color,
        'created_at'           => i.created_at.to_s,
        'updated_at'           => i.updated_at.to_s,
        'description_multiloc' => i.description_multiloc
      }
      store_ref yml_idea_status, i.id, :idea_status
      yml_idea_status
    end
  end

  def yml_ideas
    Idea.published.where.not(author_id: nil).map do |i|
      yml_idea = {
        'title_multiloc'         => i.title_multiloc,
        'body_multiloc'          => i.body_multiloc,
        'publication_status'     => i.publication_status,
        'published_at'           => i.published_at.to_s,
        'project_ref'            => lookup_ref(i.project_id, :project),
        'author_ref'             => lookup_ref(i.author_id, :user),
        'created_at'             => i.created_at.to_s,
        'updated_at'             => i.updated_at.to_s,
        'location_point_geojson' => i.location_point_geojson,
        'location_description'   => i.location_description,
        'idea_status_ref'        => lookup_ref(i.idea_status_id, :idea_status),
        'budget'                 => i.budget,
        'proposed_budget'       => i.proposed_budget,
        'text_images_attributes'       => i.text_images.map{ |i|
          {
            'imageable_field'          => i.imageable_field,
            'remote_image_url'         => i.image_url,
            'text_reference'           => i.text_reference,
            'created_at'               => i.created_at.to_s,
            'updated_at'               => i.updated_at.to_s
          }
        }
      }
      store_ref yml_idea, i.id, :idea
      yml_idea
    end
  end

  def yml_areas_ideas
    AreasIdea.where(idea: Idea.published.where.not(author_id: nil)).map do |a|
      if lookup_ref(a.idea_id, :idea)
        {
          'area_ref' => lookup_ref(a.area_id, :area),
          'idea_ref' => lookup_ref(a.idea_id, :idea)
        }
      end
    end.compact
  end

  def yml_baskets_ideas
    BasketsIdea.where(idea: Idea.published.where.not(author_id: nil)).map do |b|
      if lookup_ref(b.idea_id, :idea)
        {
          'basket_ref' => lookup_ref(b.basket_id, :basket),
          'idea_ref'   => lookup_ref(b.idea_id, :idea)
        }
      end.compact
    end
  end

  def yml_idea_files
    IdeaFile.where(idea: Idea.published.where.not(author_id: nil)).map do |i|
      {
        'idea_ref'        => lookup_ref(i.idea_id, :idea),
        'name'            => i.name,
        'remote_file_url' => i.file_url,
        'ordering'        => i.ordering,
        'created_at'      => i.created_at.to_s,
        'updated_at'      => i.updated_at.to_s
      }
    end
  end

  def yml_idea_images
    IdeaImage.where(idea: Idea.published.where.not(author_id: nil)).map do |i|
      {
        'idea_ref'         => lookup_ref(i.idea_id, :idea),
        'remote_image_url' => i.image_url,
        'ordering'         => i.ordering,
        'created_at'       => i.created_at.to_s,
        'updated_at'       => i.updated_at.to_s
      }
    end
  end

  def yml_ideas_phases
    IdeasPhase.where(idea: Idea.published.where.not(author_id: nil)).map do |i|
      {
        'idea_ref'   => lookup_ref(i.idea_id, :idea),
        'phase_ref'  => lookup_ref(i.phase_id, :phase),
        'created_at' => i.created_at.to_s,
        'updated_at' => i.updated_at.to_s
      }
    end
  end

  def yml_ideas_topics
    IdeasTopic.where(idea: Idea.published.where.not(author_id: nil)).map do |i|
      {
        'idea_ref'   => lookup_ref(i.idea_id, :idea),
        'topic_ref'  => lookup_ref(i.topic_id, :topic)
      }
    end
  end

  def yml_initiative_statuses
    InitiativeStatus.all.map do |i|
      yml_initiative_status = {
        'title_multiloc'       => i.title_multiloc,
        'ordering'             => i.ordering,
        'code'                 => i.code,
        'color'                => i.color,
        'created_at'           => i.created_at.to_s,
        'updated_at'           => i.updated_at.to_s,
        'description_multiloc' => i.description_multiloc
      }
      store_ref yml_initiative_status, i.id, :initiative_status
      yml_initiative_status
    end
  end

  def yml_initiatives
    Initiative.published.map do |i|
      yml_initiative = {
        'title_multiloc'         => i.title_multiloc,
        'body_multiloc'          => i.body_multiloc,
        'publication_status'     => i.publication_status,
        'published_at'           => i.published_at.to_s,
        'author_ref'             => lookup_ref(i.author_id, :user),
        'created_at'             => i.created_at.to_s,
        'updated_at'             => i.updated_at.to_s,
        'location_point_geojson' => i.location_point_geojson,
        'location_description'   => i.location_description,
        'text_images_attributes' => i.text_images.map{ |ti|
          {
            'imageable_field'    => ti.imageable_field,
            'remote_image_url'   => ti.image_url,
            'text_reference'     => ti.text_reference,
            'created_at'         => ti.created_at.to_s,
            'updated_at'         => ti.updated_at.to_s
          }
        }
      }
      store_ref yml_initiative, i.id, :initiative
      yml_initiative
    end
  end

  def yml_initiative_status_changes
    InitiativeStatusChange.where(initiative: Initiative.published).map do |i|
      {
        'created_at'            => i.created_at.to_s,
        'updated_at'            => i.updated_at.to_s,
        'initiative_ref'        => lookup_ref(i.initiative_id, :initiative),
        'initiative_status_ref' => lookup_ref(i.initiative_status_id, :initiative_status)
      }
    end
  end

  def yml_areas_initiatives
    AreasInitiative.where(initiative: Initiative.published).map do |a|
      if lookup_ref(a.initiative_id, :initiative)
        {
          'area_ref'       => lookup_ref(a.area_id, :area),
          'initiative_ref' => lookup_ref(a.initiative_id, :initiative)
        }
      end
    end.compact
  end

  def yml_initiative_files
    InitiativeFile.where(initiative: Initiative.published).map do |i|
      {
        'initiative_ref'  => lookup_ref(i.initiative_id, :initiative),
        'name'            => i.name,
        'remote_file_url' => i.file_url,
        'ordering'        => i.ordering,
        'created_at'      => i.created_at.to_s,
        'updated_at'      => i.updated_at.to_s,
      }
    end
  end

  def yml_initiative_images
    InitiativeImage.where(initiative: Initiative.published).map do |i|
      {
        'initiative_ref'   => lookup_ref(i.initiative_id, :initiative),
        'remote_image_url' => i.image_url,
        'ordering'         => i.ordering,
        'created_at'       => i.created_at.to_s,
        'updated_at'       => i.updated_at.to_s
      }
    end
  end

  def yml_initiatives_topics
    InitiativesTopic.where(initiative: Initiative.published).map do |i|
      {
        'initiative_ref'   => lookup_ref(i.initiative_id, :initiative),
        'topic_ref'  => lookup_ref(i.topic_id, :topic)
      }
    end
  end

  def yml_official_feedback
    OfficialFeedback.where.not(post_id: Idea.where(author_id: nil)).map do |a|
      yml_official_feedback = {
        'user_ref'        => lookup_ref(a.user_id, :user),
        'post_ref'        => lookup_ref(a.post_id, [:idea, :initiative]),
        'body_multiloc'   => a.body_multiloc,
        'author_multiloc' => a.author_multiloc,
        'created_at'      => a.created_at.to_s,
        'updated_at'      => a.updated_at.to_s
      }
      store_ref yml_official_feedback, a.id, :admin_feedback
      yml_official_feedback
    end
  end

  def yml_comments
    comments = Comment.where.not(post_id: Idea.where(author_id: nil))
    (comments.where('parent_id IS NULL')+comments.where('parent_id IS NOT NULL')).map do |c|
      yml_comment = {
        'author_ref'         => lookup_ref(c.author_id, :user),
        'post_ref'           => lookup_ref(c.post_id, [:idea, :initiative]),
        'body_multiloc'      => c.body_multiloc,
        'created_at'         => c.created_at.to_s,
        'updated_at'         => c.updated_at.to_s,
        'publication_status' => c.publication_status,
        'body_updated_at'    => c.body_updated_at.to_s
      }
      yml_comment['parent_ref'] = lookup_ref(c.parent_id, :comment) if c.parent_id
      store_ref yml_comment, c.id, :comment
      yml_comment
    end
  end

  def yml_votes
    Vote.where('user_id IS NOT NULL').where.not(votable_id: Idea.where(author_id: nil)).map do |v|
      yml_vote = {
        'votable_ref' => lookup_ref(v.votable_id, [:idea, :initiative, :comment]),
        'user_ref'    => lookup_ref(v.user_id, :user),
        'mode'        => v.mode,
        'created_at'  => v.created_at.to_s,
        'updated_at'  => v.updated_at.to_s
      }
      store_ref yml_vote, v.id, :vote
      yml_vote
    end
  end

  def yml_poll_questions
    Polls::Question.all.map do |q|
      yml_question = {
        'participation_context_ref' => lookup_ref(q.participation_context_id, [:project, :phase]),
        'title_multiloc'            => q.title_multiloc,
        'ordering'                  => q.ordering,
        'created_at'                => q.created_at.to_s,
        'updated_at'                => q.updated_at.to_s
      }
      store_ref yml_question, q.id, :poll_question
      yml_question
    end
  end

  def yml_poll_options
    Polls::Option.all.map do |o|
      yml_option = {
        'question_ref'   => lookup_ref(o.question_id, [:poll_question]),
        'title_multiloc' => o.title_multiloc,
        'ordering'       => o.ordering,
        'created_at'     => o.created_at.to_s,
        'updated_at'     => o.updated_at.to_s
      }
      store_ref yml_option, o.id, :poll_option
      yml_option
    end
  end

  def yml_poll_responses
    Polls::Response.all.map do |r|
      yml_response = {
        'participation_context_ref' => lookup_ref(r.participation_context_id, [:project, :phase]),
        'user_ref'                  => lookup_ref(r.user_id, :user),
        'created_at'                => r.created_at.to_s,
        'updated_at'                => r.updated_at.to_s
      }
      store_ref yml_response, r.id, :poll_response
      yml_response
    end
  end

  def yml_poll_response_options
    Polls::ResponseOption.all.map do |r|
      yml_response_option = {
        'response_ref' => lookup_ref(r.response_id, :poll_response),
        'option_ref'   => lookup_ref(r.option_id, :poll_option),
        'created_at'   => r.created_at.to_s,
        'updated_at'   => r.updated_at.to_s
      }
      store_ref yml_response_option, r.id, :poll_response_option
      yml_response_option
    end
  end

  def yml_volunteering_causes
    Volunteering::Cause.all.map do |c|
      yml_cause = {
        'participation_context_ref' => lookup_ref(c.participation_context_id, [:project, :phase]),
        'title_multiloc'            => c.title_multiloc,
        'description_multiloc'      => c.description_multiloc,
        'remote_image_url'          => c.image_url,
        'ordering'                  => c.ordering,
        'created_at'                => c.created_at.to_s,
        'updated_at'                => c.updated_at.to_s,
      }
      store_ref yml_cause, c.id, :volunteering_cause
      yml_cause
    end
  end

  def yml_volunteering_volunteers
    Volunteering::Volunteer.all.map do |v|
      yml_volunteer = {
        'cause_ref'   => lookup_ref(v.cause_id, [:volunteering_cause]),
        'user_ref'    => lookup_ref(v.user_id, :user),
        'created_at'  => v.created_at.to_s,
        'updated_at'  => v.updated_at.to_s
      }
      store_ref yml_volunteer, v.id, :volunteering_volunteer
      yml_volunteer
    end
  end

  def yml_maps_map_configs
    CustomMaps::MapConfig.all.map do |map_config|
      yml_map_config = {
        'project_ref'            => lookup_ref(map_config.project_id, :project),
        'center_geojson'         => map_config.center_geojson,
        'zoom_level'             => map_config.zoom_level&.to_f,
        'tile_provider'          => map_config.tile_provider,
        'created_at'             => map_config.created_at.to_s,
        'updated_at'             => map_config.updated_at.to_s
      }
      store_ref yml_map_config, map_config.id, :maps_map_config
      yml_map_config
    end
  end

  def yml_maps_layers
    CustomMaps::Layer.all.map do |layer|
      yml_layer = {
        'map_config_ref'  => lookup_ref(layer.map_config_id, :maps_map_config),
        'title_multiloc'  => layer.title_multiloc,
        'geojson'         => layer.geojson,
        'default_enabled' => layer.default_enabled,
        'marker_svg_url'  => layer.marker_svg_url,
        'created_at'      => layer.created_at.to_s,
        'updated_at'      => layer.updated_at.to_s
      }
      yml_layer
    end
  end

  def yml_maps_legend_items
    CustomMaps::LegendItem.all.map do |legend_item|
      {
        'map_config_ref' => lookup_ref(legend_item.map_config_id, :maps_map_config),
        'title_multiloc' => legend_item.title_multiloc,
        'color'          => legend_item.color,
        'created_at'     => legend_item.created_at.to_s,
        'updated_at'     => legend_item.updated_at.to_s
      }
    end
  end
end
