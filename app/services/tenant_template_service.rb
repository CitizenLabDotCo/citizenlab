class TenantTemplateService


  def available_templates
    Dir[Rails.root.join('config', 'tenant_templates', '*.yml')].map do |file|
      File.basename(file, ".yml")
    end
  end


  def resolve_and_apply_template template_name, is_path=false
    apply_template resolve_template(template_name, is_path)
  end

  def apply_template template
    template = YAML.load template
    start_of_day = Time.now.in_time_zone(Tenant.settings('core','timezone')).beginning_of_day
    obj_to_id_and_class = {}
    template['models'].each do |model_name, fields|
      model_class = model_name.classify.constantize

      fields.each do |attributes|
        model = model_class.new
        image_assignments = {}
        attributes.each do |field_name, field_value|
          if (field_name =~ /_multiloc$/) && (field_value.is_a? String)
            multiloc_value = CL2_SUPPORTED_LOCALES.map do |locale|
              translation = I18n.with_locale(locale) { I18n.t!(field_value) }
              [locale, translation]
            end.to_h
            model.send("#{field_name}=", multiloc_value)
          elsif field_name.end_with?('_ref')
            if field_value
              id, ref_class = obj_to_id_and_class[field_value]
              model.send("#{field_name.chomp '_ref'}=", ref_class.find(id))
            end
          elsif field_name.end_with?('_timediff')
            if field_value && field_value.kind_of?(Numeric)
              time = start_of_day + field_value.hours
              model.send("#{field_name.chomp '_timediff'}=", time)
            end
          elsif !model_name.include?('image') && field_name.start_with?('remote_') && field_name.end_with?('_url') && !field_name.include?('file')
            image_assignments[field_name] = field_value
          else
            model.send("#{field_name}=", field_value)
          end
        end
        begin 
          model.save!
          ImageAssignmentJob.perform_later(model, image_assignments) if image_assignments.present?
        rescue Exception => e
          byebug
          raise e
        end
        obj_to_id_and_class[attributes] = [model.id, model_class]
      end
    end
    nil
  end

  def tenant_to_template tenant
    init_refs
    @template = {'models' => {}}

    Apartment::Tenant.switch(tenant.schema_name) do
      @template['models']['area']          = yml_areas
      @template['models']['project']       = yml_projects
      @template['models']['phase']         = yml_phases
      @template['models']['areas_project'] = yml_areas_projects
      @template['models']['basket']        = yml_baskets
      @template['models']['user']          = yml_users
      @template['models']['idea_status']   = yml_idea_statuses
      @template['models']['idea']          = yml_ideas
      @template['models']['areas_idea']    = yml_areas_ideas
      @template['models']['baskets_idea']  = yml_baskets_ideas
      @template['models']['comment']       = yml_comments
    end
    @template.to_yaml
  end


  private
  
  def resolve_template template_name, is_path=false
    if is_path
      open(template_name).read
    elsif template_name.kind_of? String
      throw "Unknown template '#{template_name}'" unless available_templates.include? template_name
      open(Rails.root.join('config', 'tenant_templates', "#{template_name}.yml")).read
    elsif template_name.kind_of? Hash
      template_name.to_yaml
    elsif template_name.nil?
      open(Rails.root.join('config', 'tenant_templates', "base.yml")).read
    else
      throw "Could not resolve template"
    end
  end

  def init_refs
    @refs = {}
  end

  def lookup_ref id, model_name
    if model_name.kind_of?(Array)
      model_name.each do |n|
        return @refs[n][id] if @refs[n][id]
      end
    else
      if not @refs[model_name]
        byebug
      end
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
      }
      store_ref yml_area, a.id, :area
      yml_area
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
        'description_preview_multiloc' => p.description_preview_multiloc, 
        'process_type'                 => p.process_type,
        'internal_role'                => p.internal_role,
        'publication_status'           => p.publication_status,
        'ordering'                     => p.ordering
      })
      store_ref yml_project, p.id, :project
      yml_project
    end
  end

  def yml_phases
    Phase.all.map do |p|
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

  def yml_areas_projects
    AreasProject.all.map do |ap|
      {
        'area_ref'    => lookup_ref(ap.area_id, :area),
        'project_ref' => lookup_ref(ap.project_id, :project)
      }
    end
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
      store_ref yml_basket, a.id, :basket
      yml_basket
    end
  end

  def yml_users
    # Roles are left out so first user to login becomes
    # admin and because project ids of moderators would
    # become invalid.
    # Pending invitations are cleared out.

    # TODO properly copy project moderator roles
    # TODO properly copy all custom field values
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
        'gender'                    => u.gender,
        'birthyear'                 => u.birthyear,
        'domicile'                  => u.domicile,
        'education'                 => u.education,
        'registration_completed_at' => u.registration_completed_at.to_s
      }
      if !yml_user['password_digest']
        yml_user['password'] = SecureRandom.urlsafe_base64 32
      end
      store_ref yml_user, u.id, :user
      yml_user
    end
  end

  def yml_idea_statuses
    IdeaStatus.all.map do |is|
      yml_idea_status = {
        'title_multiloc'       => is.title_multiloc,
        'ordering'             => is.ordering,
        'code'                 => is.code,
        'color'                => is.color,
        'created_at'           => is.created_at.to_s,
        'updated_at'           => is.updated_at.to_s,
        'description_multiloc' => is.description_multiloc
      }
      store_ref yml_idea_status, is.id, :idea_status
      yml_idea_status
    end
  end

  def yml_ideas
    Idea.published.map do |i|
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
        'budget'                 => i.budget
      }
      store_ref yml_idea, i.id, :idea
      yml_idea
    end
  end

  def yml_areas_ideas
    AreasIdea.all.map do |ai|
      if lookup_ref(ai.idea_id, :idea)
        {
          'area_ref' => lookup_ref(ai.area_id, :area),
          'idea_ref' => lookup_ref(ai.idea_id, :idea)
        }
      end
    end.compact
  end

  def yml_baskets_ideas
    BasketsIdea.all.map do |bi|
      if lookup_ref(ai.idea_id, :idea)
        {
          'basket_ref' => lookup_ref(bi.basket_id, :basket),
          'idea_ref'   => lookup_ref(bi.idea_id, :idea)
        }
      end.compact
    end
  end

  def yml_comments
    (Comment.where('parent_id IS NULL')+Comment.where('parent_id IS NOT NULL')).map do |c|
      yml_comment = {
        'author_ref'         => lookup_ref(c.author_id, :user),
        'idea_ref'           => lookup_ref(c.idea_id, :idea),
        'body_multiloc'      => c.body_multiloc,
        'created_at'         => c.created_at.to_s,
        'updated_at'         => c.updated_at.to_s,
        'publication_status' => c.publication_status,
        'body_updated_at'    => c.body_updated_at.to_s,
      }
      if yml_comment['idea_ref'].blank?
        byebug
      end
      yml_comment['parent_ref'] = lookup_ref(c.parent_id, :comment) if c.parent_id
      store_ref yml_comment, c.id, :comment
      yml_comment
    end
  end
end
