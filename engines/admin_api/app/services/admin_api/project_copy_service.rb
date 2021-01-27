module AdminApi
  class ProjectCopyService

    def import template
      service = TenantTemplateService.new
      same_template = service.translate_and_fix_locales template
      project_ids_before = Project.ids
      ActiveRecord::Base.transaction do
        service.resolve_and_apply_template same_template, validate: false
      end
      Project.where.not(id: project_ids_before).each do |project|
        project.update!(slug: SlugService.new.generate_slug(project, project.slug))
        project.set_default_topics!
      end
    end

    def export project, include_ideas: false, anonymize_users: true, shift_timestamps: 0, new_slug: nil, new_title_multiloc: nil, timeline_start_at: nil, new_publication_status: nil
      @project = project
      init_refs
      @template = {'models' => {}}

      # TODO deal with linking idea_statuses, topics, custom field values and maybe areas and groups
      @template['models']['custom_form']           = yml_custom_forms shift_timestamps: shift_timestamps
      @template['models']['custom_field']          = yml_custom_fields shift_timestamps: shift_timestamps
      @template['models']['custom_field_option']   = yml_custom_field_options shift_timestamps: shift_timestamps
      @template['models']['project']               = yml_projects new_slug: new_slug, new_publication_status: new_publication_status, new_title_multiloc: new_title_multiloc, shift_timestamps: shift_timestamps
      @template['models']['project_file']          = yml_project_files shift_timestamps: shift_timestamps
      @template['models']['project_image']         = yml_project_images shift_timestamps: shift_timestamps
      @template['models']['phase']                 = yml_phases timeline_start_at: timeline_start_at, shift_timestamps: shift_timestamps
      @template['models']['phase_file']            = yml_phase_files shift_timestamps: shift_timestamps
      @template['models']['event']                 = yml_events shift_timestamps: shift_timestamps
      @template['models']['event_file']            = yml_event_files shift_timestamps: shift_timestamps
      @template['models']['permission']            = yml_permissions shift_timestamps: shift_timestamps
      @template['models']['polls/question']        = yml_poll_questions shift_timestamps: shift_timestamps
      @template['models']['polls/option']          = yml_poll_options shift_timestamps: shift_timestamps
      @template['models']['volunteering/cause']    = yml_volunteering_causes shift_timestamps: shift_timestamps
      @template['models']['maps/map_config']       = yml_maps_map_configs shift_timestamps: shift_timestamps
      @template['models']['maps/layer']            = yml_maps_layers shift_timestamps: shift_timestamps
      @template['models']['maps/legend_item']      = yml_maps_legend_items shift_timestamps: shift_timestamps

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
        @template['models']['vote']                = yml_votes shift_timestamps: shift_timestamps
      end

      @template
    end


    private

    def init_refs
      @refs = {}
    end

    def lookup_ref id, model_name
      return nil if !id
      if model_name.kind_of?(Array)
        model_name.each do |n|
          return @refs[n][id] if @refs[n][id]
        end
      else
        @refs[model_name][id]
      end
    end

    def store_ref yml_obj, id, model_name
      @refs[model_name] ||= {}
      @refs[model_name][id] = yml_obj
    end

    def yml_custom_forms shift_timestamps: 0
      return [] if !@project.custom_form_id
      yml_custom_form = {
        'created_at' => shift_timestamp(@project.custom_form.created_at, shift_timestamps)&.iso8601,
        'updated_at' => shift_timestamp(@project.custom_form.updated_at, shift_timestamps)&.iso8601
      }
      store_ref yml_custom_form, @project.custom_form.id, :custom_form
      [yml_custom_form]
    end

    def yml_custom_fields shift_timestamps: 0
      return [] if !@project.custom_form_id
      CustomField.where(resource: @project.custom_form).map do |c|
        yml_custom_field = {
          'resource_ref'         => c.resource_id && lookup_ref(c.resource_id, :custom_form),
          'key'                  => c.key,
          'input_type'           => c.input_type,
          'title_multiloc'       => c.title_multiloc,
          'description_multiloc' => c.description_multiloc,
          'ordering'             => c.ordering,
          'created_at'           => shift_timestamp(c.created_at, shift_timestamps)&.iso8601,
          'updated_at'           => shift_timestamp(c.updated_at, shift_timestamps)&.iso8601,
          'enabled'              => c.enabled,
          'required'             => c.required,
          'code'                 => c.code
        }
        store_ref yml_custom_field, c.id, :custom_field
        yml_custom_field
      end
    end

    def yml_custom_field_options shift_timestamps: 0
      return [] if !@project.custom_form_id
      CustomFieldOption.where(custom_field: @project.custom_form.custom_fields).map do |c|
        yml_custom_field_option = {
          'custom_field_ref'     => lookup_ref(c.custom_field_id, :custom_field),
          'key'                  => c.key,
          'title_multiloc'       => c.title_multiloc,
          'ordering'             => c.ordering,
          'created_at'           => shift_timestamp(c.created_at, shift_timestamps)&.iso8601,
          'updated_at'           => shift_timestamp(c.updated_at, shift_timestamps)&.iso8601
        }
        store_ref yml_custom_field_option, c.id, :custom_field_option
        yml_custom_field_option
      end
    end

    def yml_projects shift_timestamps: 0, new_slug: nil, new_title_multiloc: nil, new_publication_status: nil
      yml_project = yml_participation_context @project, shift_timestamps: shift_timestamps
      yml_project.merge!({
        'title_multiloc'               => new_title_multiloc || @project.title_multiloc,
        'description_multiloc'         => TextImageService.new.render_data_images(@project, :description_multiloc),
        'created_at'                   => shift_timestamp(@project.created_at, shift_timestamps)&.iso8601,
        'updated_at'                   => shift_timestamp(@project.updated_at, shift_timestamps)&.iso8601,
        'remote_header_bg_url'         => @project.header_bg_url,
        'visible_to'                   => @project.visible_to,
        'description_preview_multiloc' => @project.description_preview_multiloc, 
        'process_type'                 => @project.process_type,
        'admin_publication_attributes' => { 'publication_status' => new_publication_status || @project.admin_publication.publication_status },
        'custom_form_ref'              => lookup_ref(@project.custom_form_id, :custom_form),
        'text_images_attributes'       => @project.text_images.map{ |ti|
          {
            'imageable_field'          => ti.imageable_field,
            'remote_image_url'         => ti.image_url,
            'text_reference'           => ti.text_reference,
            'created_at'               => ti.created_at.to_s,
            'updated_at'               => ti.updated_at.to_s
          }
        }
      })
      yml_project['slug'] = new_slug if new_slug.present?
      store_ref yml_project, @project.id, :project
      [yml_project]
    end

    def yml_project_files shift_timestamps: 0
      @project.project_files.map do |p|
        {
          'project_ref'     => lookup_ref(p.project_id, :project),
          'ordering'        => p.ordering,
          'created_at'      => shift_timestamp(p.created_at, shift_timestamps)&.iso8601,
          'updated_at'      => shift_timestamp(p.updated_at, shift_timestamps)&.iso8601,
          'name'            => p.name,
          'remote_file_url' => p.file_url
        }
      end
    end

    def yml_project_images shift_timestamps: 0
      @project.project_images.map do |p|
        {
          'project_ref'      => lookup_ref(p.project_id, :project),
          'remote_image_url' => p.image_url,
          'ordering'         => p.ordering,
          'created_at'       => shift_timestamp(p.created_at, shift_timestamps)&.iso8601,
          'updated_at'       => shift_timestamp(p.updated_at, shift_timestamps)&.iso8601
        }
      end
    end

    def yml_phases shift_timestamps: 0, timeline_start_at: nil
      if timeline_start_at && @project.phases.first
        kickoff_at = @project.phases.first.start_at
        shift_timestamps = (Date.parse(timeline_start_at) - kickoff_at).to_i
      end
      @project.phases.map do |p|
        yml_phase = yml_participation_context p, shift_timestamps: shift_timestamps
        yml_phase.merge!({
          'project_ref'            => lookup_ref(p.project_id, :project),
          'title_multiloc'         => p.title_multiloc,
          'description_multiloc'   => TextImageService.new.render_data_images(p, :description_multiloc),
          'start_at'               => shift_timestamp(p.start_at, shift_timestamps)&.iso8601,
          'end_at'                 => shift_timestamp(p.end_at, shift_timestamps)&.iso8601,
          'created_at'             => shift_timestamp(p.created_at, shift_timestamps)&.iso8601,
          'updated_at'             => shift_timestamp(p.updated_at, shift_timestamps)&.iso8601,
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

    def yml_phase_files shift_timestamps: 0
      @project.phases.flat_map(&:phase_files).map do |p|
        {
          'phase_ref'       => lookup_ref(p.phase_id, :phase),
          'ordering'        => p.ordering,
          'name'            => p.name,
          'remote_file_url' => p.file_url,
          'created_at'      => shift_timestamp(p.created_at, shift_timestamps)&.iso8601,
          'updated_at'      => shift_timestamp(p.updated_at, shift_timestamps)&.iso8601
        }
      end
    end

    def yml_participation_context pc, shift_timestamps: 0
      yml_pc = {
        'presentation_mode'            => pc.presentation_mode,
        'participation_method'         => pc.participation_method,
        'posting_enabled'              => pc.posting_enabled,
        'commenting_enabled'           => pc.commenting_enabled,
        'voting_enabled'               => pc.voting_enabled,
        'downvoting_enabled'           => pc.downvoting_enabled,
        'voting_method'                => pc.voting_method,
        'voting_limited_max'           => pc.voting_limited_max,
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

    def yml_poll_questions shift_timestamps: 0
      participation_context_ids = [@project.id] + @project.phases.ids
      Polls::Question.where(participation_context_id: participation_context_ids).map do |q|
        yml_question = {
          'participation_context_ref' => lookup_ref(q.participation_context_id, [:project, :phase]),
          'title_multiloc'            => q.title_multiloc,
          'ordering'                  => q.ordering,
          'created_at'                => shift_timestamp(q.created_at, shift_timestamps)&.iso8601,
          'updated_at'                => shift_timestamp(q.updated_at, shift_timestamps)&.iso8601
        }
        store_ref yml_question, q.id, :poll_question
        yml_question
      end
    end

    def yml_poll_options shift_timestamps: 0
      participation_context_ids = [@project.id] + @project.phases.ids
      Polls::Option.left_outer_joins(:question).where(polls_questions: {participation_context_id: participation_context_ids}).map do |o|
        yml_option = {
          'question_ref'   => lookup_ref(o.question_id, :poll_question),
          'title_multiloc' => o.title_multiloc,
          'ordering'       => o.ordering,
          'created_at'     => shift_timestamp(o.created_at, shift_timestamps)&.iso8601,
          'updated_at'     => shift_timestamp(o.updated_at, shift_timestamps)&.iso8601
        }
        store_ref yml_option, o.id, :poll_option
        yml_option
      end
    end

    def yml_volunteering_causes shift_timestamps: 0
      participation_context_ids = [@project.id] + @project.phases.ids
      Volunteering::Cause.where(participation_context_id: participation_context_ids).map do |c|
        yml_cause = {
          'participation_context_ref' => lookup_ref(c.participation_context_id, [:project, :phase]),
          'title_multiloc'            => c.title_multiloc,
          'description_multiloc'      => c.description_multiloc,
          'remote_image_url'          => c.image_url,
          'ordering'                  => c.ordering,
          'created_at'                => shift_timestamp(c.created_at, shift_timestamps)&.iso8601,
          'updated_at'                => shift_timestamp(c.updated_at, shift_timestamps)&.iso8601
        }
        store_ref yml_cause, c.id, :volunteering_cause
        yml_cause
      end
    end

    def yml_maps_map_configs shift_timestamps: 0
      Maps::MapConfig.where(project_id: @project.id).map do |map_config|
        yml_map_config = {
          'project_ref'            => lookup_ref(map_config.project_id, :project),
          'center_geojson'         => map_config.center_geojson,
          'zoom_level'             => map_config.zoom_level&.to_f,
          'tile_provider'          => map_config.tile_provider,
          'created_at'             => shift_timestamp(map_config.created_at, shift_timestamps)&.iso8601,
          'updated_at'             => shift_timestamp(map_config.updated_at, shift_timestamps)&.iso8601
        }
        store_ref yml_map_config, map_config.id, :maps_map_config
        yml_map_config
      end
    end

    def yml_maps_layers shift_timestamps: 0
      (@project.map_config&.layers || []).map do |layer|
        yml_layer = {
          'map_config_ref'  => lookup_ref(layer.map_config_id, :maps_map_config),
          'title_multiloc'  => layer.title_multiloc,
          'geojson'         => layer.geojson,
          'default_enabled' => layer.default_enabled,
          'marker_svg_url'  => layer.marker_svg_url,
          'created_at'      => shift_timestamp(layer.created_at, shift_timestamps)&.iso8601,
          'updated_at'      => shift_timestamp(layer.updated_at, shift_timestamps)&.iso8601
        }
        yml_layer
      end
    end

    def yml_maps_legend_items shift_timestamps: 0
      (@project.map_config&.legend_items || []).map do |legend_item|
        {
          'map_config_ref' => lookup_ref(legend_item.map_config_id, :maps_map_config),
          'title_multiloc' => legend_item.title_multiloc,
          'color'          => legend_item.color,
          'created_at'     => shift_timestamp(legend_item.created_at, shift_timestamps)&.iso8601,
          'updated_at'     => shift_timestamp(legend_item.updated_at, shift_timestamps)&.iso8601
        }
      end
    end

    def yml_users anonymize_users, shift_timestamps: 0
      service = AnonymizeUserService.new
      user_ids = []
      idea_ids = @project.ideas.ids
      user_ids += Idea.where(id: idea_ids).pluck(:author_id)
      comment_ids = Comment.where(post_id: idea_ids, post_type: 'Idea').ids
      user_ids += Comment.where(id: comment_ids).pluck(:author_id)
      vote_ids = Vote.where(votable_id: [idea_ids + comment_ids]).ids
      user_ids += Vote.where(id: vote_ids).pluck(:user_id)
      participation_context_ids = [@project.id] + @project.phases.ids
      user_ids += Basket.where(participation_context_id: participation_context_ids).pluck(:user_id)
      user_ids += OfficialFeedback.where(post_id: idea_ids, post_type: 'Idea').pluck(:user_id)

      User.where(id: user_ids.uniq).map do |u|
        yml_user = if anonymize_users
          yml_user = service.anonymized_attributes AppConfiguration.instance.settings('core', 'locales'), user: u
          yml_user
        else
           yml_user = { 
            'email'                     => u.email, 
            'password_digest'           => u.password_digest,
            'created_at'                => shift_timestamp(u.created_at, shift_timestamps)&.iso8601,
            'updated_at'                => shift_timestamp(u.updated_at, shift_timestamps)&.iso8601,
            'remote_avatar_url'         => u.avatar_url,
            'first_name'                => u.first_name,
            'last_name'                 => u.last_name,
            'locale'                    => u.locale,
            'bio_multiloc'              => u.bio_multiloc,
            'cl1_migrated'              => u.cl1_migrated,
            'custom_field_values'       => u.custom_field_values.delete_if{|k,v| v.nil?},
            'registration_completed_at' => shift_timestamp(u.registration_completed_at, shift_timestamps)&.iso8601,
            'verified'                  => u.verified,
          }
          if !yml_user['password_digest']
            yml_user['password'] = SecureRandom.urlsafe_base64 32
          end
          yml_user
        end
        store_ref yml_user, u.id, :user
        yml_user
      end
    end

    def yml_baskets shift_timestamps: 0
      participation_context_ids = [@project.id] + @project.phases.ids
      Basket.where(participation_context_id: participation_context_ids).map do |b|
        yml_basket = {
          'submitted_at'              => shift_timestamp(b.submitted_at, shift_timestamps)&.iso8601,
          'user_ref'                  => lookup_ref(b.user_id, :user),
          'participation_context_ref' => lookup_ref(b.participation_context_id, [:project, :phase]),
          'created_at'                => shift_timestamp(b.created_at, shift_timestamps)&.iso8601,
          'updated_at'                => shift_timestamp(b.updated_at, shift_timestamps)&.iso8601
        }
        store_ref yml_basket, b.id, :basket
        yml_basket
      end
    end

    def yml_events shift_timestamps: 0
      @project.events.map do |e|
        yml_event = {
          'project_ref'            => lookup_ref(e.project_id, :project),
          'title_multiloc'         => e.title_multiloc,
          'description_multiloc'   => TextImageService.new.render_data_images(e, :description_multiloc),
          'location_multiloc'      => e.location_multiloc,
          'start_at'               => shift_timestamp(e.start_at, shift_timestamps)&.iso8601,
          'end_at'                 => shift_timestamp(e.end_at, shift_timestamps)&.iso8601,
          'created_at'             => shift_timestamp(e.created_at, shift_timestamps)&.iso8601,
          'updated_at'             => shift_timestamp(e.updated_at, shift_timestamps)&.iso8601,
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

    def yml_event_files shift_timestamps: 0
      @project.events.flat_map(&:event_files).map do |e|
        {
          'event_ref'       => lookup_ref(e.event_id, :event),
          'name'            => e.name,
          'ordering'        => e.ordering,
          'remote_file_url' => e.file_url,
          'created_at'      => shift_timestamp(e.created_at, shift_timestamps)&.iso8601,
          'updated_at'      => shift_timestamp(e.updated_at, shift_timestamps)&.iso8601
        }
      end
    end

    def yml_permissions shift_timestamps: 0
      permission_scope_ids = [@project.id] + @project.phases.ids
      Permission.where(permission_scope_id: permission_scope_ids).map do |p|
        yml_permission = {
          'action'          => p.action,
          'permitted_by'    => p.permitted_by,
          'permission_scope_ref' => lookup_ref(p.permission_scope_id, [:project, :phase]),
          'created_at'      => shift_timestamp(p.created_at, shift_timestamps)&.iso8601,
          'updated_at'      => shift_timestamp(p.updated_at, shift_timestamps)&.iso8601
        }
        store_ref yml_permission, p.id, :permission
        yml_permission
      end
    end

    def yml_ideas shift_timestamps: 0
      @project.ideas.published.where.not(author_id: nil).map do |i|
        yml_idea = {
          'title_multiloc'         => i.title_multiloc,
          'body_multiloc'          => i.body_multiloc,
          'publication_status'     => i.publication_status,
          'published_at'           => shift_timestamp(i.published_at, shift_timestamps)&.iso8601,
          'project_ref'            => lookup_ref(i.project_id, :project),
          'author_ref'             => lookup_ref(i.author_id, :user),
          'created_at'             => shift_timestamp(i.created_at, shift_timestamps)&.iso8601,
          'updated_at'             => shift_timestamp(i.updated_at, shift_timestamps)&.iso8601,
          'location_point_geojson' => i.location_point_geojson,
          'location_description'   => i.location_description,
          'budget'                 => i.budget,
          'proposed_budget'       => i.proposed_budget,
          'text_images_attributes'       => @project.text_images.map{ |i|
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

    def yml_baskets_ideas shift_timestamps: 0
      BasketsIdea.where(idea_id: @project.ideas.published.where.not(author_id: nil).ids).map do |b|
        if lookup_ref(b.idea_id, :idea)
          {
            'basket_ref' => lookup_ref(b.basket_id, :basket),
            'idea_ref'   => lookup_ref(b.idea_id, :idea)
          }
        end.compact
      end
    end

    def yml_idea_files shift_timestamps: 0
      IdeaFile.where(idea_id: @project.ideas.published.where.not(author_id: nil).ids).map do |i|
        {
          'idea_ref'        => lookup_ref(i.idea_id, :idea),
          'name'            => i.name,
          'ordering'        => i.ordering,
          'remote_file_url' => i.file_url,
          'created_at'      => shift_timestamp(i.created_at, shift_timestamps)&.iso8601,
          'updated_at'      => shift_timestamp(i.updated_at, shift_timestamps)&.iso8601
        }
      end
    end
        
    def yml_idea_images shift_timestamps: 0
      IdeaImage.where(idea_id: @project.ideas.published.where.not(author_id: nil).ids).map do |i|
        {
          'idea_ref'         => lookup_ref(i.idea_id, :idea),
          'remote_image_url' => i.image_url,
          'ordering'         => i.ordering,
          'created_at'       => shift_timestamp(i.created_at, shift_timestamps)&.iso8601,
          'updated_at'       => shift_timestamp(i.updated_at, shift_timestamps)&.iso8601
        }
      end
    end

    def yml_ideas_phases shift_timestamps: 0
      IdeasPhase.where(idea_id: @project.ideas.published.where.not(author_id: nil).ids).map do |i|
        {
          'idea_ref'   => lookup_ref(i.idea_id, :idea),
          'phase_ref'  => lookup_ref(i.phase_id, :phase),
          'created_at' => shift_timestamp(i.created_at, shift_timestamps)&.iso8601,
          'updated_at' => shift_timestamp(i.updated_at, shift_timestamps)&.iso8601
        }
      end
    end

    def yml_comments shift_timestamps: 0
      (Comment.where('parent_id IS NULL').where(post_id: @project.ideas.published.where.not(author_id: nil).ids, post_type: 'Idea')+Comment.where('parent_id IS NOT NULL').where(post_id: @project.ideas.published.ids, post_type: 'Idea')).map do |c|
        yml_comment = {
          'author_ref'         => lookup_ref(c.author_id, :user),
          'post_ref'           => lookup_ref(c.post_id, :idea),
          'body_multiloc'      => c.body_multiloc,
          'created_at'         => shift_timestamp(c.created_at, shift_timestamps)&.iso8601,
          'updated_at'         => shift_timestamp(c.updated_at, shift_timestamps)&.iso8601,
          'publication_status' => c.publication_status,
          'body_updated_at'    => shift_timestamp(c.body_updated_at, shift_timestamps)&.iso8601
        }
        yml_comment['parent_ref'] = lookup_ref(c.parent_id, :comment) if c.parent_id
        store_ref yml_comment, c.id, :comment
        yml_comment
      end
    end

    def yml_official_feedback shift_timestamps: 0
      OfficialFeedback.where(post_id: @project.ideas.published.where.not(author_id: nil).ids, post_type: 'Idea').map do |o|
        yml_official_feedback = {
          'post_ref'           => lookup_ref(o.post_id, :idea),
          'user_ref'           => lookup_ref(o.user_id, :user),
          'body_multiloc'      => o.body_multiloc,
          'author_multiloc'    => o.author_multiloc,
          'created_at'         => shift_timestamp(o.created_at, shift_timestamps)&.iso8601,
          'updated_at'         => shift_timestamp(o.updated_at, shift_timestamps)&.iso8601
        }
        store_ref yml_official_feedback, o.id, :official_feedback
        yml_official_feedback
      end
    end

    def yml_votes shift_timestamps: 0
      idea_ids = @project.ideas.published.where.not(author_id: nil).ids
      comment_ids = Comment.where(post_id: idea_ids, post_type: 'Idea')
      Vote.where('user_id IS NOT NULL').where(votable_id: idea_ids + comment_ids).map do |v|
        yml_vote = {
          'votable_ref' => lookup_ref(v.votable_id, [:idea, :comment]),
          'user_ref'    => lookup_ref(v.user_id, :user),
          'mode'        => v.mode,
          'created_at'  => shift_timestamp(v.created_at, shift_timestamps)&.iso8601,
          'updated_at'  => shift_timestamp(v.updated_at, shift_timestamps)&.iso8601
        }
        store_ref yml_vote, v.id, :vote
        yml_vote
      end
    end

    def shift_timestamp value, shift_timestamps
      value && (value + shift_timestamps.days)
    end

  end
end
