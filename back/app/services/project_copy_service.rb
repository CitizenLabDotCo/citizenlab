# frozen_string_literal: true

class ProjectCopyService < TemplateService
  def import(template, folder: nil, local_copy: false)
    same_template = MultiTenancy::Templates::Utils.translate_and_fix_locales(template)

    created_objects_ids = ActiveRecord::Base.transaction do
      tenant_deserializer.deserialize(same_template, validate: false, local_copy: local_copy)
    end

    project = Project.find(created_objects_ids['Project'].first)
    unless local_copy
      project.update!(slug: SlugService.new.generate_slug(project, project.slug))
      project.set_default_topics!
    end
    project.update! folder: folder if folder

    project
  end

  def export(
    project,
    local_copy: false,
    include_ideas: false,
    anonymize_users: true,
    shift_timestamps: 0,
    new_slug: nil,
    new_title_multiloc: nil,
    timeline_start_at: nil,
    new_publication_status: nil
  )
    @local_copy = local_copy
    @project = project
    @template = { 'models' => {} }

    # TODO: deal with linking idea_statuses, topics, custom field values and maybe areas and groups
    @template['models']['project']                 = yml_projects new_slug: new_slug, new_publication_status: new_publication_status, new_title_multiloc: new_title_multiloc, shift_timestamps: shift_timestamps
    @template['models']['project_file']            = yml_project_files shift_timestamps: shift_timestamps
    @template['models']['project_image']           = yml_project_images shift_timestamps: shift_timestamps
    @template['models']['phase']                   = yml_phases timeline_start_at: timeline_start_at, shift_timestamps: shift_timestamps
    @template['models']['phase_file']              = yml_phase_files shift_timestamps: shift_timestamps
    @template['models']['custom_form']             = yml_custom_forms shift_timestamps: shift_timestamps
    @template['models']['custom_field']            = yml_custom_fields shift_timestamps: shift_timestamps
    @template['models']['custom_field_option']     = yml_custom_field_options shift_timestamps: shift_timestamps
    @template['models']['permission']              = yml_permissions shift_timestamps: shift_timestamps
    @template['models']['polls/question']          = yml_poll_questions shift_timestamps: shift_timestamps
    @template['models']['polls/option']            = yml_poll_options shift_timestamps: shift_timestamps
    @template['models']['volunteering/cause']      = yml_volunteering_causes shift_timestamps: shift_timestamps
    @template['models']['custom_maps/map_config']  = yml_maps_map_configs shift_timestamps: shift_timestamps
    @template['models']['custom_maps/layer']       = yml_maps_layers shift_timestamps: shift_timestamps
    @template['models']['custom_maps/legend_item'] = yml_maps_legend_items shift_timestamps: shift_timestamps

    @template['models']['content_builder/layout'], layout_images_mapping = yml_content_builder_layouts shift_timestamps: shift_timestamps
    @template['models']['content_builder/layout_image'] = yml_content_builder_layout_images layout_images_mapping, shift_timestamps: shift_timestamps

    unless local_copy
      @template['models']['event']      = yml_events shift_timestamps: shift_timestamps
      @template['models']['event_file'] = yml_event_files shift_timestamps: shift_timestamps
    end

    if include_ideas
      @template['models']['user']                = yml_users anonymize_users, shift_timestamps: shift_timestamps
      @template['models']['basket']              = yml_baskets shift_timestamps: shift_timestamps
      @template['models']['idea']                = yml_ideas shift_timestamps: shift_timestamps
      @template['models']['baskets_idea']        = yml_baskets_ideas shift_timestamps: shift_timestamps
      @template['models']['idea_file']           = yml_idea_files shift_timestamps: shift_timestamps
      @template['models']['idea_image']          = yml_idea_images shift_timestamps: shift_timestamps
      @template['models']['ideas_phase']         = yml_ideas_phases shift_timestamps: shift_timestamps
      @template['models']['comment']             = yml_comments shift_timestamps: shift_timestamps
      @template['models']['official_feedback']   = yml_official_feedback shift_timestamps: shift_timestamps
      @template['models']['reaction'] = yml_reactions shift_timestamps: shift_timestamps
      @template['models']['followers'] = yml_followers shift_timestamps: shift_timestamps
    end

    @template
  end

  private

  def tenant_deserializer
    # `save_temp_remote_urls: false` because if we store images on another domain (URLs point to another domain),
    # it's not possible to fetch these images by JS.
    # Currently, we fetch them by JS on Back Office to preview images.
    @tenant_deserializer ||= MultiTenancy::Templates::TenantDeserializer.new(
      save_temp_remote_urls: false
    )
  end

  def yml_content_builder_layouts(shift_timestamps: 0)
    layout_images_mapping = {}

    layouts = ContentBuilder::Layout.where(content_buildable_id: @project.id).map do |layout|
      craftjs = layout.craftjs_jsonmultiloc

      craftjs.each_key do |locale|
        craftjs[locale].each_value do |node|
          next unless ContentBuilder::LayoutService.new.craftjs_element_of_type?(node, 'Image')

          source_image_code = node['props']['dataCode']
          new_image_code = ContentBuilder::LayoutImage.generate_code
          node['props']['dataCode'] = new_image_code
          layout_images_mapping[source_image_code] = new_image_code
        end
      end

      yml_layout = {
        'content_buildable_ref' => lookup_ref(layout.content_buildable_id, :project),
        'content_buildable_type' => layout.content_buildable_type,
        'code' => layout.code,
        'enabled' => layout.enabled,
        'craftjs_jsonmultiloc' => craftjs,
        'created_at' => shift_timestamp(layout.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(layout.updated_at, shift_timestamps)&.iso8601
      }
      store_ref yml_layout, layout.id, :content_builder_layout
      yml_layout
    end

    [layouts, layout_images_mapping]
  end

  def yml_content_builder_layout_images(layout_images_mapping, shift_timestamps: 0)
    source_image_codes = layout_images_mapping.keys.map(&:to_s)

    ContentBuilder::LayoutImage.where(code: source_image_codes).map do |image|
      yml_layout_image = {
        'code' => layout_images_mapping[image.code],
        'remote_image_url' => image.image_url,
        'created_at' => shift_timestamp(image.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(image.updated_at, shift_timestamps)&.iso8601
      }
      store_ref yml_layout_image, image.id, :content_builder_layout_image
      yml_layout_image
    end
  end

  def yml_custom_forms(shift_timestamps: 0)
    ([@project.custom_form] + @project.phases.map(&:custom_form)).compact.map do |cf|
      yml_custom_form = {
        'participation_context_ref' => lookup_ref(cf.participation_context_id, %i[project phase]),
        'created_at' => shift_timestamp(cf.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(cf.updated_at, shift_timestamps)&.iso8601
      }
      store_ref yml_custom_form, cf.id, :custom_form
      yml_custom_form
    end
  end

  def yml_custom_fields(shift_timestamps: 0)
    custom_form_ids = ([@project.custom_form_id] + @project.phases.map(&:custom_form_id)).compact
    CustomField.where(resource: custom_form_ids).map do |field|
      yml_custom_field = {
        'resource_ref' => field.resource_id && lookup_ref(field.resource_id, :custom_form),
        'key' => field.key,
        'input_type' => field.input_type,
        'title_multiloc' => field.title_multiloc,
        'description_multiloc' => field.description_multiloc,
        'ordering' => field.ordering,
        'created_at' => shift_timestamp(field.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(field.updated_at, shift_timestamps)&.iso8601,
        'enabled' => field.enabled,
        'required' => field.required,
        'code' => field.code,
        'answer_visible_to' => field.answer_visible_to,
        'hidden' => field.hidden,
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
      store_ref yml_custom_field, field.id, :custom_field
      yml_custom_field
    end
  end

  def yml_custom_field_options(shift_timestamps: 0)
    custom_form_ids = ([@project.custom_form_id] + @project.phases.map(&:custom_form_id)).compact
    CustomFieldOption.where(custom_field: CustomField.where(resource: custom_form_ids)).map do |c|
      yml_custom_field_option = {
        'custom_field_ref' => lookup_ref(c.custom_field_id, :custom_field),
        'key' => c.key,
        'title_multiloc' => c.title_multiloc,
        'ordering' => c.ordering,
        'created_at' => shift_timestamp(c.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(c.updated_at, shift_timestamps)&.iso8601
      }
      store_ref yml_custom_field_option, c.id, :custom_field_option
      yml_custom_field_option
    end
  end

  def yml_participation_context(pc, shift_timestamps: 0)
    yml_pc = {
      'presentation_mode' => pc.presentation_mode,
      'participation_method' => pc.participation_method,
      'posting_enabled' => pc.posting_enabled,
      'posting_method' => pc.posting_method,
      'posting_limited_max' => pc.posting_limited_max,
      'commenting_enabled' => pc.commenting_enabled,
      'reacting_enabled' => pc.reacting_enabled,
      'reacting_like_method' => pc.reacting_like_method,
      'reacting_like_limited_max' => pc.reacting_like_limited_max,
      'reacting_dislike_enabled' => pc.reacting_dislike_enabled,
      'reacting_dislike_method' => pc.reacting_dislike_method,
      'reacting_dislike_limited_max' => pc.reacting_dislike_limited_max,
      'poll_anonymous' => pc.poll_anonymous,
      'ideas_order' => pc.ideas_order,
      'input_term' => pc.input_term,
      'baskets_count' => pc.baskets_count,
      'votes_count' => pc.votes_count
    }
    if yml_pc['participation_method'] == 'voting'
      yml_pc['voting_method'] = pc.voting_method
      yml_pc['voting_max_total'] = pc.voting_max_total
      yml_pc['voting_min_total'] = pc.voting_min_total
      yml_pc['voting_max_votes_per_idea'] = pc.voting_max_votes_per_idea
      yml_pc['voting_term_singular_multiloc'] = pc.voting_term_singular_multiloc
      yml_pc['voting_term_plural_multiloc'] = pc.voting_term_plural_multiloc
    end
    if yml_pc['participation_method'] == 'survey'
      yml_pc['survey_embed_url'] = pc.survey_embed_url
      yml_pc['survey_service'] = pc.survey_service
    end

    if yml_pc['participation_method'] == 'document_annotation'
      yml_pc['document_annotation_embed_url'] = pc.document_annotation_embed_url
    end

    yml_pc
  end

  def yml_projects(shift_timestamps: 0, new_slug: nil, new_title_multiloc: nil, new_publication_status: nil)
    yml_project = yml_participation_context @project, shift_timestamps: shift_timestamps
    yml_project.merge!({
      'title_multiloc' => new_title_multiloc || @project.title_multiloc,
      'description_multiloc' => @project.description_multiloc,
      'created_at' => shift_timestamp(@project.created_at, shift_timestamps)&.iso8601,
      'updated_at' => shift_timestamp(@project.updated_at, shift_timestamps)&.iso8601,
      'remote_header_bg_url' => @project.header_bg_url,
      'visible_to' => @project.visible_to,
      'description_preview_multiloc' => @project.description_preview_multiloc,
      'process_type' => @project.process_type,
      'admin_publication_attributes' => { 'publication_status' => new_publication_status || @project.admin_publication.publication_status },
      'text_images_attributes' => @project.text_images.map do |ti|
        {
          'imageable_field' => ti.imageable_field,
          'remote_image_url' => ti.image_url,
          'text_reference' => ti.text_reference,
          'created_at' => ti.created_at.to_s,
          'updated_at' => ti.updated_at.to_s
        }
      end,
      'include_all_areas' => @project.include_all_areas
    })
    yml_project['slug'] = new_slug if new_slug.present?
    store_ref yml_project, @project.id, :project
    [yml_project]
  end

  def yml_project_files(shift_timestamps: 0)
    @project.project_files.map do |p|
      {
        'project_ref' => lookup_ref(p.project_id, :project),
        'ordering' => p.ordering,
        'created_at' => shift_timestamp(p.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(p.updated_at, shift_timestamps)&.iso8601,
        'name' => p.name,
        'remote_file_url' => p.file_url
      }
    end
  end

  def yml_project_images(shift_timestamps: 0)
    @project.project_images.map do |p|
      {
        'project_ref' => lookup_ref(p.project_id, :project),
        'remote_image_url' => p.image_url,
        'ordering' => p.ordering,
        'created_at' => shift_timestamp(p.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(p.updated_at, shift_timestamps)&.iso8601
      }
    end
  end

  def yml_phases(shift_timestamps: 0, timeline_start_at: nil)
    if timeline_start_at && @project.phases.first
      kickoff_at = @project.phases.first.start_at
      shift_timestamps = (Date.parse(timeline_start_at) - kickoff_at).to_i
    end
    @project.phases.map do |phase|
      yml_phase = yml_participation_context phase, shift_timestamps: shift_timestamps
      yml_phase.merge!({
        'project_ref' => lookup_ref(phase.project_id, :project),
        'title_multiloc' => phase.title_multiloc,
        'description_multiloc' => phase.description_multiloc,
        'start_at' => shift_timestamp(phase.start_at, shift_timestamps, leave_blank: false)&.iso8601,
        'end_at' => shift_timestamp(phase.end_at, shift_timestamps, leave_blank: false)&.iso8601,
        'created_at' => shift_timestamp(phase.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(phase.updated_at, shift_timestamps)&.iso8601,
        'text_images_attributes' => phase.text_images.map do |ti|
          {
            'imageable_field' => ti.imageable_field,
            'remote_image_url' => ti.image_url,
            'text_reference' => ti.text_reference,
            'created_at' => ti.created_at.to_s,
            'updated_at' => ti.updated_at.to_s
          }
        end
      })
      store_ref yml_phase, phase.id, :phase
      yml_phase
    end
  end

  def yml_phase_files(shift_timestamps: 0)
    @project.phases.flat_map(&:phase_files).map do |p|
      {
        'phase_ref' => lookup_ref(p.phase_id, :phase),
        'ordering' => p.ordering,
        'name' => p.name,
        'remote_file_url' => p.file_url,
        'created_at' => shift_timestamp(p.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(p.updated_at, shift_timestamps)&.iso8601
      }
    end
  end

  def yml_poll_questions(shift_timestamps: 0)
    participation_context_ids = [@project.id] + @project.phases.ids
    Polls::Question.where(participation_context_id: participation_context_ids).map do |q|
      yml_question = {
        'participation_context_ref' => lookup_ref(q.participation_context_id, %i[project phase]),
        'title_multiloc' => q.title_multiloc,
        'ordering' => q.ordering,
        'created_at' => shift_timestamp(q.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(q.updated_at, shift_timestamps)&.iso8601,
        'question_type' => q.question_type,
        'max_options' => q.max_options
      }
      store_ref yml_question, q.id, :poll_question
      yml_question
    end
  end

  def yml_poll_options(shift_timestamps: 0)
    participation_context_ids = [@project.id] + @project.phases.ids
    Polls::Option.left_outer_joins(:question).where(polls_questions: { participation_context_id: participation_context_ids }).map do |o|
      yml_option = {
        'question_ref' => lookup_ref(o.question_id, :poll_question),
        'title_multiloc' => o.title_multiloc,
        'ordering' => o.ordering,
        'created_at' => shift_timestamp(o.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(o.updated_at, shift_timestamps)&.iso8601
      }
      store_ref yml_option, o.id, :poll_option
      yml_option
    end
  end

  def yml_volunteering_causes(shift_timestamps: 0)
    participation_context_ids = [@project.id] + @project.phases.ids
    Volunteering::Cause.where(participation_context_id: participation_context_ids).map do |c|
      yml_cause = {
        'participation_context_ref' => lookup_ref(c.participation_context_id, %i[project phase]),
        'title_multiloc' => c.title_multiloc,
        'description_multiloc' => c.description_multiloc,
        'remote_image_url' => c.image_url,
        'ordering' => c.ordering,
        'created_at' => shift_timestamp(c.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(c.updated_at, shift_timestamps)&.iso8601
      }
      store_ref yml_cause, c.id, :volunteering_cause
      yml_cause
    end
  end

  def yml_maps_map_configs(shift_timestamps: 0)
    CustomMaps::MapConfig.where(project_id: @project.id).map do |map_config|
      yml_map_config = {
        'project_ref' => lookup_ref(map_config.project_id, :project),
        'center_geojson' => map_config.center_geojson,
        'zoom_level' => map_config.zoom_level&.to_f,
        'tile_provider' => map_config.tile_provider,
        'created_at' => shift_timestamp(map_config.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(map_config.updated_at, shift_timestamps)&.iso8601
      }
      store_ref yml_map_config, map_config.id, :maps_map_config
      yml_map_config
    end
  end

  def yml_maps_layers(shift_timestamps: 0)
    (@project.map_config&.layers || []).map do |layer|
      yml_layer = {
        'map_config_ref' => lookup_ref(layer.map_config_id, :maps_map_config),
        'title_multiloc' => layer.title_multiloc,
        'geojson' => layer.geojson,
        'default_enabled' => layer.default_enabled,
        'marker_svg_url' => layer.marker_svg_url,
        'created_at' => shift_timestamp(layer.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(layer.updated_at, shift_timestamps)&.iso8601
      }
      yml_layer
    end
  end

  def yml_maps_legend_items(shift_timestamps: 0)
    (@project.map_config&.legend_items || []).map do |legend_item|
      {
        'map_config_ref' => lookup_ref(legend_item.map_config_id, :maps_map_config),
        'title_multiloc' => legend_item.title_multiloc,
        'color' => legend_item.color,
        'ordering' => legend_item.ordering,
        'created_at' => shift_timestamp(legend_item.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(legend_item.updated_at, shift_timestamps)&.iso8601
      }
    end
  end

  def yml_users(anonymize_users, shift_timestamps: 0)
    service = AnonymizeUserService.new
    user_ids = []
    idea_ids = @project.ideas.ids
    user_ids += Idea.where(id: idea_ids).pluck(:author_id)
    comment_ids = Comment.where(post_id: idea_ids, post_type: 'Idea').ids
    user_ids += Comment.where(id: comment_ids).pluck(:author_id)
    reaction_ids = Reaction.where(reactable_id: [idea_ids + comment_ids]).ids
    user_ids += Reaction.where(id: reaction_ids).pluck(:user_id)
    participation_context_ids = [@project.id] + @project.phases.ids
    user_ids += Basket.where(participation_context_id: participation_context_ids).pluck(:user_id)
    user_ids += OfficialFeedback.where(post_id: idea_ids, post_type: 'Idea').pluck(:user_id)
    user_ids += Follower.where(followable_id: ([@project.id] + idea_ids)).pluck(:user_id)

    User.where(id: user_ids.uniq).map do |user|
      yml_user = if anonymize_users
        service.anonymized_attributes AppConfiguration.instance.settings('core', 'locales'), user: user
      else
        yml_user_from user
      end
      store_ref yml_user, user.id, :user
      yml_user
    end
  end

  def yml_user_from(user)
    {
      'email' => user.email,
      'password_digest' => user.password_digest,
      'created_at' => shift_timestamp(user.created_at, shift_timestamps)&.iso8601,
      'updated_at' => shift_timestamp(user.updated_at, shift_timestamps)&.iso8601,
      'remote_avatar_url' => user.avatar_url,
      'first_name' => user.first_name,
      'last_name' => user.last_name,
      'locale' => user.locale,
      'bio_multiloc' => user.bio_multiloc,
      'cl1_migrated' => user.cl1_migrated,
      'custom_field_values' => user.custom_field_values.delete_if { |_k, v| v.nil? },
      'registration_completed_at' => shift_timestamp(user.registration_completed_at, shift_timestamps)&.iso8601,
      'verified' => user.verified,
      'block_start_at' => user.block_start_at,
      'block_end_at' => user.block_end_at,
      'block_reason' => user.block_reason
    }.tap do |yml_user|
      unless yml_user['password_digest']
        yml_user['password'] = SecureRandom.urlsafe_base64 32
      end
    end
  end

  def yml_baskets(shift_timestamps: 0)
    participation_context_ids = [@project.id] + @project.phases.ids
    Basket.where(participation_context_id: participation_context_ids).map do |b|
      yml_basket = {
        'submitted_at' => shift_timestamp(b.submitted_at, shift_timestamps)&.iso8601,
        'user_ref' => lookup_ref(b.user_id, :user),
        'participation_context_ref' => lookup_ref(b.participation_context_id, %i[project phase]),
        'created_at' => shift_timestamp(b.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(b.updated_at, shift_timestamps)&.iso8601
      }
      store_ref yml_basket, b.id, :basket
      yml_basket
    end
  end

  def yml_events(shift_timestamps: 0)
    @project.events.map do |event|
      yml_event = {
        'project_ref' => lookup_ref(event.project_id, :project),
        'title_multiloc' => event.title_multiloc,
        'description_multiloc' => event.description_multiloc,
        'location_multiloc' => event.location_multiloc,
        'online_link' => event.online_link,
        'start_at' => shift_timestamp(event.start_at, shift_timestamps)&.iso8601,
        'end_at' => shift_timestamp(event.end_at, shift_timestamps)&.iso8601,
        'created_at' => shift_timestamp(event.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(event.updated_at, shift_timestamps)&.iso8601,
        'text_images_attributes' => event.text_images.map do |text_image|
          {
            'imageable_field' => text_image.imageable_field,
            'remote_image_url' => text_image.image_url,
            'text_reference' => text_image.text_reference,
            'created_at' => text_image.created_at.to_s,
            'updated_at' => text_image.updated_at.to_s
          }
        end
      }
      store_ref yml_event, event.id, :event
      yml_event
    end
  end

  def yml_event_files(shift_timestamps: 0)
    @project.events.flat_map(&:event_files).map do |e|
      {
        'event_ref' => lookup_ref(e.event_id, :event),
        'name' => e.name,
        'ordering' => e.ordering,
        'remote_file_url' => e.file_url,
        'created_at' => shift_timestamp(e.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(e.updated_at, shift_timestamps)&.iso8601
      }
    end
  end

  def yml_permissions(shift_timestamps: 0)
    permission_scope_ids = [@project.id] + @project.phases.ids
    Permission.where(permission_scope_id: permission_scope_ids).map do |p|
      yml_permission = {
        'action' => p.action,
        'permitted_by' => p.permitted_by,
        'permission_scope_ref' => lookup_ref(p.permission_scope_id, %i[project phase]),
        'global_custom_fields' => p.global_custom_fields,
        'created_at' => shift_timestamp(p.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(p.updated_at, shift_timestamps)&.iso8601
      }
      store_ref yml_permission, p.id, :permission
      yml_permission
    end
  end

  def yml_ideas(shift_timestamps: 0)
    custom_fields = CustomField.where(resource: CustomForm.where(participation_context: (@project.phases + [@project])))
    @project.ideas.published.map do |idea|
      yml_idea = {
        'title_multiloc' => idea.title_multiloc,
        'body_multiloc' => idea.body_multiloc,
        'publication_status' => idea.publication_status,
        'published_at' => shift_timestamp(idea.published_at, shift_timestamps)&.iso8601,
        'project_ref' => lookup_ref(idea.project_id, :project),
        'author_ref' => lookup_ref(idea.author_id, :user),
        'author_hash' => idea.author_hash,
        'anonymous' => idea.anonymous,
        'created_at' => shift_timestamp(idea.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(idea.updated_at, shift_timestamps)&.iso8601,
        'location_point_geojson' => idea.location_point_geojson,
        'location_description' => idea.location_description,
        'budget' => idea.budget,
        'proposed_budget' => idea.proposed_budget,
        'baskets_count' => idea.baskets_count,
        'votes_count' => idea.votes_count,
        'text_images_attributes' => idea.text_images.map do |text_image|
          {
            'imageable_field' => text_image.imageable_field,
            'remote_image_url' => text_image.image_url,
            'text_reference' => text_image.text_reference,
            'created_at' => text_image.created_at.to_s,
            'updated_at' => text_image.updated_at.to_s
          }
        end,
        'creation_phase_ref' => lookup_ref(idea.creation_phase_id, :phase)
      }
      yml_idea['custom_field_values'] = filter_custom_field_values(idea.custom_field_values, custom_fields) if custom_fields
      store_ref yml_idea, idea.id, :idea
      yml_idea
    end
  end

  def yml_baskets_ideas(shift_timestamps: 0)
    BasketsIdea.where(idea_id: @project.ideas.published.where.not(author_id: nil).ids).map do |b|
      if lookup_ref(b.idea_id, :idea)
        {
          'basket_ref' => lookup_ref(b.basket_id, :basket),
          'idea_ref' => lookup_ref(b.idea_id, :idea),
          'votes' => b.votes
        }
      end.compact
    end
  end

  def yml_idea_files(shift_timestamps: 0)
    IdeaFile.where(idea_id: @project.ideas.published.where.not(author_id: nil).ids).map do |i|
      {
        'idea_ref' => lookup_ref(i.idea_id, :idea),
        'name' => i.name,
        'ordering' => i.ordering,
        'remote_file_url' => i.file_url,
        'created_at' => shift_timestamp(i.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(i.updated_at, shift_timestamps)&.iso8601
      }
    end
  end

  def yml_idea_images(shift_timestamps: 0)
    IdeaImage.where(idea_id: @project.ideas.published.where.not(author_id: nil).ids).map do |i|
      {
        'idea_ref' => lookup_ref(i.idea_id, :idea),
        'remote_image_url' => i.image_url,
        'ordering' => i.ordering,
        'created_at' => shift_timestamp(i.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(i.updated_at, shift_timestamps)&.iso8601
      }
    end
  end

  def yml_ideas_phases(shift_timestamps: 0)
    IdeasPhase.where(idea_id: @project.ideas.published.where.not(author_id: nil).ids).map do |i|
      {
        'idea_ref' => lookup_ref(i.idea_id, :idea),
        'phase_ref' => lookup_ref(i.phase_id, :phase),
        'baskets_count' => i.baskets_count,
        'votes_count' => i.votes_count,
        'created_at' => shift_timestamp(i.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(i.updated_at, shift_timestamps)&.iso8601
      }
    end
  end

  def yml_comments(shift_timestamps: 0)
    (Comment.where(parent_id: nil).where(post_id: @project.ideas.published.where.not(author_id: nil).ids, post_type: 'Idea') + Comment.where.not(parent_id: nil).where(post_id: @project.ideas.published.ids, post_type: 'Idea')).map do |c|
      yml_comment = {
        'author_ref' => lookup_ref(c.author_id, :user),
        'author_hash' => c.author_hash,
        'anonymous' => c.anonymous,
        'post_ref' => lookup_ref(c.post_id, :idea),
        'body_multiloc' => c.body_multiloc,
        'created_at' => shift_timestamp(c.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(c.updated_at, shift_timestamps)&.iso8601,
        'publication_status' => c.publication_status,
        'body_updated_at' => shift_timestamp(c.body_updated_at, shift_timestamps)&.iso8601
      }
      yml_comment['parent_ref'] = lookup_ref(c.parent_id, :comment) if c.parent_id
      store_ref yml_comment, c.id, :comment
      yml_comment
    end
  end

  def yml_official_feedback(shift_timestamps: 0)
    OfficialFeedback.where(post_id: @project.ideas.published.where.not(author_id: nil).ids, post_type: 'Idea').map do |o|
      yml_official_feedback = {
        'post_ref' => lookup_ref(o.post_id, :idea),
        'user_ref' => lookup_ref(o.user_id, :user),
        'body_multiloc' => o.body_multiloc,
        'author_multiloc' => o.author_multiloc,
        'created_at' => shift_timestamp(o.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(o.updated_at, shift_timestamps)&.iso8601
      }
      store_ref yml_official_feedback, o.id, :official_feedback
      yml_official_feedback
    end
  end

  def yml_reactions(shift_timestamps: 0)
    idea_ids = @project.ideas.published.where.not(author_id: nil).ids
    comment_ids = Comment.where(post_id: idea_ids, post_type: 'Idea')
    Reaction.where.not(user_id: nil).where(reactable_id: idea_ids + comment_ids).map do |v|
      yml_reaction = {
        'reactable_ref' => lookup_ref(v.reactable_id, %i[idea comment]),
        'user_ref' => lookup_ref(v.user_id, :user),
        'mode' => v.mode,
        'created_at' => shift_timestamp(v.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(v.updated_at, shift_timestamps)&.iso8601
      }
      store_ref yml_reaction, v.id, :reaction
      yml_reaction
    end
  end

  def yml_followers(shift_timestamps: 0)
    Follower.where(followable_id: ([@project.id] + @project.ideas.published.where.not(author_id: nil).ids))
    @project.followers.map do |follower|
      {
        'followable_ref' => lookup_ref(follower.followable_id, %i[project]),
        'user_ref' => lookup_ref(follower.user_id, :user),
        'created_at' => shift_timestamp(follower.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(follower.updated_at, shift_timestamps)&.iso8601
      }
    end
  end

  def shift_timestamp(value, shift_timestamps, leave_blank: @local_copy)
    return if leave_blank

    value && (value + shift_timestamps.days)
  end
end
