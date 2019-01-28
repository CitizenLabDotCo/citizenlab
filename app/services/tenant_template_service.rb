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
      @template['models']['areas_project'] = yml_areas_projects
      @template['models']['user']          = yml_users
      @template['models']['idea_status']   = yml_idea_statuses
      @template['models']['idea']          = yml_ideas
      @template['models']['areas_idea']    = yml_areas_ideas
    end
    @template.to_yaml
  end


  private
  
  def resolve_template template_name, is_path=false
    if is_path
      YAML.load_file(template_name)
    elsif template_name.kind_of? String
      throw "Unknown template '#{template_name}'" unless available_templates.include? template_name
      YAML.load_file(Rails.root.join('config', 'tenant_templates', "#{template_name}.yml"))
    elsif template_name.kind_of? Hash
      template_name
    elsif template_name.nil?
      YAML.load_file(Rails.root.join('config', 'tenant_templates', "base.yml"))
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
      yml_project = {
        'title_multiloc'               => p.title_multiloc,
        'description_multiloc'         => p.description_multiloc,
        'created_at'                   => p.created_at.to_s,
        'updated_at'                   => p.updated_at.to_s,
        'remote_header_bg_url'         => p.header_bg_url,
        'visible_to'                   => p.visible_to,
        'description_preview_multiloc' => p.description_preview_multiloc,
        'presentation_mode'            => p.presentation_mode,
        'participation_method'         => p.participation_method,
        'posting_enabled'              => p.posting_enabled,
        'commenting_enabled'           => p.commenting_enabled,
        'voting_enabled'               => p.voting_enabled,
        'voting_method'                => p.voting_method,
        'voting_limited_max'           => p.voting_limited_max,
        'process_type'                 => p.process_type,
        'internal_role'                => p.internal_role,
        'publication_status'           => p.publication_status,
        'ordering'                     => p.ordering,
        'max_budget'                   => p.max_budget
      }
      if yml_project['participation_method'] == 'survey'
        yml_project['survey_embed_url'] = p.survey_embed_url
        yml_project['survey_service']   = p.survey_service
      end
      store_ref yml_project, p.id, :project
      yml_project
    end
  end

  def yml_areas_projects
    AreasProject.all.map do |ap|
      {
        'area_ref'    => lookup_ref(ap.area_id, :area),
        'project_ref' => lookup_ref(ap.project_id, :project)
      }
    end
  end

  def yml_users
    # Roles are left out so first user to login becomes
    # admin and because project ids of moderators would
    # become invalid.
    # Pending invitations are cleared out.

    # TODO properly copy project moderator roles
    # TODO properly copy all custom field values
    User.where.not(invite_status: 'pending').map do |u|
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
      users_hash[u.id] = yml_user
      yml_user
    end
  end

  def yml_idea_statuses
    Idea.all.map do |is|
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
    Idea.all.map do |i|
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
      {
        'area_ref'    => lookup_ref(ai.area_id, :area),
        'idea_ref' => lookup_ref(ai.idea_id, :project)
      }
    end
  end
end
