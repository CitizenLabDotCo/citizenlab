module AdminApi
  class ProjectCopyService

    def import template
      service = TenantTemplateService.new
      template = template.to_yaml
      tenant_locales = Tenant.current.settings.dig('core', 'locales')
      (service.template_locales(template) - tenant_locales).each do |locale_from|
        template = service.change_locales template, locale_from, tenant_locales.first
      end
      ActiveRecord::Base.transaction do
        service.resolve_and_apply_template YAML.load(template)
      end
    end

    def export project, include_ideas: false, anonymize_users: true, translate_content: false, shift_timestamps: 0, new_slug: nil
      @project = project
      init_refs
      @template = {'models' => {}}

      # TODO deal with linking idea_statuses, topics, custom field values and maybe areas and groups
      @template['models']['project']             = yml_projects new_slug
      @template['models']['project_file']        = yml_project_files
      @template['models']['project_image']       = yml_project_images
      @template['models']['phase']               = yml_phases
      @template['models']['phase_file']          = yml_phase_files
      @template['models']['event']               = yml_events
      @template['models']['event_file']          = yml_event_files
      @template['models']['permission']          = yml_permissions
      if include_ideas
        @template['models']['user']                = yml_users anonymize_users
        @template['models']['basket']              = yml_baskets
        @template['models']['idea']                = yml_ideas
        @template['models']['baskets_idea']        = yml_baskets_ideas
        @template['models']['idea_file']           = yml_idea_files
        @template['models']['idea_image']          = yml_idea_images
        @template['models']['ideas_phase']         = yml_ideas_phases
        @template['models']['comment']             = yml_comments
        @template['models']['vote']                = yml_votes
      end
      @template
    end


    private

    def init_refs
      @refs = {}
    end

    def lookup_ref id, model_name
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

    def yml_projects new_slug
      yml_project = yml_participation_context @project
      yml_project.merge!({
        'title_multiloc'               => @project.title_multiloc,
        'description_multiloc'         => @project.description_multiloc,
        'created_at'                   => @project.created_at.to_s,
        'updated_at'                   => @project.updated_at.to_s,
        'remote_header_bg_url'         => @project.header_bg_url,
        'visible_to'                   => @project.visible_to,
        'description_preview_multiloc' => @project.description_preview_multiloc, 
        'process_type'                 => @project.process_type,
        'publication_status'           => @project.publication_status,
        'ordering'                     => @project.ordering
      })
      yml_project['slug'] = new_slug if new_slug.present?
      store_ref yml_project, @project.id, :project
      [yml_project]
    end

    def yml_project_files
      @project.project_files.map do |p|
        {
          'project_ref'     => lookup_ref(p.project_id, :project),
          'remote_file_url' => p.file_url,
          'ordering'        => p.ordering,
          'created_at'      => p.created_at.to_s,
          'updated_at'      => p.updated_at.to_s,
          'name'            => p.name
        }
      end
    end

    def yml_project_images
      @project.project_images.map do |p|
        {
          'project_ref'      => lookup_ref(p.project_id, :project),
          'remote_image_url' => p.image_url,
          'ordering'         => p.ordering,
          'created_at'       => p.created_at.to_s,
          'updated_at'       => p.updated_at.to_s
        }
      end
    end

    def yml_phases
      @project.phases.map do |p|
        yml_phase = yml_participation_context p
        yml_phase.merge!({
          'project_ref'          => lookup_ref(p.project_id, :project),
          'title_multiloc'       => p.title_multiloc,
          'description_multiloc' => p.description_multiloc,
          'start_at'             => p.start_at.to_s,
          'end_at'               => p.end_at.to_s,
          'created_at'           => p.created_at.to_s,
          'updated_at'           => p.updated_at.to_s
        })
        store_ref yml_phase, p.id, :phase
        yml_phase
      end
    end

    def yml_phase_files
      @project.phases.flat_map(&:phase_files).map do |p|
        {
          'phase_ref'       => lookup_ref(p.phase_id, :phase),
          'remote_file_url' => p.file_url,
          'ordering'        => p.ordering,
          'created_at'      => p.created_at.to_s,
          'updated_at'      => p.updated_at.to_s,
          'name'            => p.name
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

    def yml_users anonymize_users
      service = AnonymizeUserService.new
      user_ids = []
      idea_ids = @project.ideas.ids
      user_ids += Idea.where(id: idea_ids).pluck(:author_id)
      comment_ids = Comment.where(idea_id: idea_ids).ids
      user_ids += Comment.where(id: comment_ids).pluck(:author_id)
      vote_ids = Vote.where(votable_id: [idea_ids + comment_ids]).ids
      user_ids += Vote.where(id: vote_ids).pluck(:user_id)
      participation_context_ids = [@project.id] + @project.phases.ids
      user_ids += Basket.where(participation_context_id: participation_context_ids).pluck(:user_id)

      User.where(id: user_ids.uniq).map do |u|
        yml_user = if anonymize_users
          yml_user = service.anonymized_attributes Tenant.settings('core', 'locales'), user: u
          yml_user.delete 'custom_field_values'
          yml_user
        else
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
            'custom_field_values'       => u.custom_field_values.delete_if{|k,v| v.nil?},
            'registration_completed_at' => u.registration_completed_at.to_s
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

    def yml_baskets
      participation_context_ids = [@project.id] + @project.phases.ids
      Basket.where(participation_context_id: participation_context_ids).map do |b|
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
      @project.events.map do |e|
        yml_event = {
          'project_ref'          => lookup_ref(e.project_id, :project),
          'title_multiloc'       => e.title_multiloc,
          'description_multiloc' => e.description_multiloc,
          'location_multiloc'    => e.location_multiloc,
          'start_at'             => e.start_at.to_s,
          'end_at'               => e.end_at.to_s,
          'created_at'           => e.created_at.to_s,
          'updated_at'           => e.updated_at.to_s
        }
        store_ref yml_event, e.id, :event
        yml_event
      end
    end

    def yml_event_files
      @project.events.flat_map(&:event_files).map do |e|
        {
          'event_ref'       => lookup_ref(e.event_id, :event),
          'remote_file_url' => e.file_url,
          'ordering'        => e.ordering,
          'created_at'      => e.created_at.to_s,
          'updated_at'      => e.updated_at.to_s,
          'name'            => e.name
        }
      end
    end

    def yml_permissions
      permittable_ids = [@project.id] + @project.phases.ids
      Permission.where(permittable_id: permittable_ids).map do |p|
        yml_permission = {
          'action'          => p.action,
          'permitted_by'    => p.permitted_by,
          'permittable_ref' => lookup_ref(p.permittable_id, [:project, :phase]),
          'created_at'      => p.created_at.to_s,
          'updated_at'      => p.updated_at.to_s
        }
        store_ref yml_permission, p.id, :permission
        yml_permission
      end
    end

    def yml_ideas
      @project.ideas.published.map do |i|
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
          'budget'                 => i.budget
        }
        store_ref yml_idea, i.id, :idea
        yml_idea
      end
    end

    def yml_baskets_ideas
      BasketsIdea.where(idea_id: @project.ideas.published.ids).map do |b|
        if lookup_ref(b.idea_id, :idea)
          {
            'basket_ref' => lookup_ref(b.basket_id, :basket),
            'idea_ref'   => lookup_ref(b.idea_id, :idea)
          }
        end.compact
      end
    end

    def yml_idea_files
      IdeaFile.where(idea_id: @project.ideas.published.ids).map do |i|
        {
          'idea_ref'        => lookup_ref(i.idea_id, :idea),
          'remote_file_url' => i.file_url,
          'ordering'        => i.ordering,
          'created_at'      => i.created_at.to_s,
          'updated_at'      => i.updated_at.to_s,
          'name'            => i.name
        }
      end
    end
        
    def yml_idea_images
      IdeaImage.where(idea_id: @project.ideas.published.ids).map do |i|
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
      IdeasPhase.where(idea_id: @project.ideas.published.ids).map do |i|
        {
          'idea_ref'   => lookup_ref(i.idea_id, :idea),
          'phase_ref'  => lookup_ref(i.phase_id, :phase),
          'created_at' => i.created_at.to_s,
          'updated_at' => i.updated_at.to_s
        }
      end
    end

    def yml_comments
      (Comment.where('parent_id IS NULL').where(idea_id: @project.ideas.published.ids)+Comment.where('parent_id IS NOT NULL').where(idea_id: @project.ideas.published.ids)).map do |c|
        yml_comment = {
          'author_ref'         => lookup_ref(c.author_id, :user),
          'idea_ref'           => lookup_ref(c.idea_id, :idea),
          'body_multiloc'      => c.body_multiloc,
          'created_at'         => c.created_at.to_s,
          'updated_at'         => c.updated_at.to_s,
          'publication_status' => c.publication_status,
          'body_updated_at'    => c.body_updated_at.to_s,
        }
        yml_comment['parent_ref'] = lookup_ref(c.parent_id, :comment) if c.parent_id
        store_ref yml_comment, c.id, :comment
        yml_comment
      end
    end

    def yml_votes
      idea_ids = @project.ideas.published.ids
      comment_ids = Comment.where(idea_id: idea_ids)
      Vote.where(votable_id: idea_ids + comment_ids).map do |v|
        yml_vote = {
          'votable_ref' => lookup_ref(v.votable_id, [:idea, :comment]),
          'user_ref'    => lookup_ref(v.user_id, :user),
          'mode'        => v.mode,
          'created_at'  => v.created_at.to_s,
          'updated_at'  => v.updated_at.to_s
        }
        store_ref yml_vote, v.id, :vote
        yml_vote
      end
    end

  end
end
