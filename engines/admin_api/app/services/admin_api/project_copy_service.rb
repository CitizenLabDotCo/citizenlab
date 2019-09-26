module AdminApi
  class ProjectCopyService

    def import template
      service = TenantTemplateService.new
      same_template = service.translate_and_fix_locales template
      ActiveRecord::Base.transaction do
        service.resolve_and_apply_template same_template, validate: false
      end
    end

    def export project, include_ideas: false, anonymize_users: true, shift_timestamps: 0, new_slug: nil
      @project = project
      init_refs
      @template = {'models' => {}}

      # TODO deal with linking idea_statuses, topics, custom field values and maybe areas and groups
      @template['models']['project']               = yml_projects new_slug, shift_timestamps: shift_timestamps
      @template['models']['project_file']          = yml_project_files shift_timestamps: shift_timestamps
      @template['models']['project_image']         = yml_project_images shift_timestamps: shift_timestamps
      @template['models']['phase']                 = yml_phases shift_timestamps: shift_timestamps
      @template['models']['phase_file']            = yml_phase_files shift_timestamps: shift_timestamps
      @template['models']['event']                 = yml_events shift_timestamps: shift_timestamps
      @template['models']['event_file']            = yml_event_files shift_timestamps: shift_timestamps
      @template['models']['permission']            = yml_permissions shift_timestamps: shift_timestamps
      @template['models']['polls/question']        = yml_poll_questions shift_timestamps: shift_timestamps
      @template['models']['polls/option']          = yml_poll_options shift_timestamps: shift_timestamps
      @template['models']['polls/response']        = yml_poll_responses shift_timestamps: shift_timestamps
      @template['models']['polls/response_option'] = yml_poll_response_options shift_timestamps: shift_timestamps
      yml_poll_questions
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

    def yml_projects new_slug, shift_timestamps: 0
      yml_project = yml_participation_context @project, shift_timestamps: shift_timestamps
      yml_project.merge!({
        'title_multiloc'               => @project.title_multiloc,
        'description_multiloc'         => @project.description_multiloc,
        'created_at'                   => shift_timestamp(@project.created_at, shift_timestamps)&.iso8601,
        'updated_at'                   => shift_timestamp(@project.updated_at, shift_timestamps)&.iso8601,
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

    def yml_project_files shift_timestamps: 0
      @project.project_files.map do |p|
        {
          'project_ref'     => lookup_ref(p.project_id, :project),
          'remote_file_url' => p.file_url,
          'ordering'        => p.ordering,
          'created_at'      => shift_timestamp(p.created_at, shift_timestamps)&.iso8601,
          'updated_at'      => shift_timestamp(p.updated_at, shift_timestamps)&.iso8601,
          'name'            => p.name
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

    def yml_phases shift_timestamps: 0
      @project.phases.map do |p|
        yml_phase = yml_participation_context p, shift_timestamps: shift_timestamps
        yml_phase.merge!({
          'project_ref'          => lookup_ref(p.project_id, :project),
          'title_multiloc'       => p.title_multiloc,
          'description_multiloc' => p.description_multiloc,
          'start_at'             => shift_timestamp(p.start_at, shift_timestamps)&.iso8601,
          'end_at'               => shift_timestamp(p.end_at, shift_timestamps)&.iso8601,
          'created_at'           => shift_timestamp(p.created_at, shift_timestamps)&.iso8601,
          'updated_at'           => shift_timestamp(p.updated_at, shift_timestamps)&.iso8601
        })
        store_ref yml_phase, p.id, :phase
        yml_phase
      end
    end

    def yml_phase_files shift_timestamps: 0
      @project.phases.flat_map(&:phase_files).map do |p|
        {
          'phase_ref'       => lookup_ref(p.phase_id, :phase),
          'remote_file_url' => p.file_url,
          'ordering'        => p.ordering,
          'created_at'      => shift_timestamp(p.created_at, shift_timestamps)&.iso8601,
          'updated_at'      => shift_timestamp(p.updated_at, shift_timestamps)&.iso8601,
          'name'            => p.name
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

    def yml_poll_responses shift_timestamps: 0
      participation_context_ids = [@project.id] + @project.phases.ids
      Polls::Response.where(participation_context_id: participation_context_ids).map do |r|
        yml_response = {
          'participation_context_ref' => lookup_ref(r.participation_context_id, [:project, :phase]),
          'user_ref'                  => lookup_ref(r.user_id, :user),
          'created_at'                => shift_timestamp(r.created_at, shift_timestamps)&.iso8601,
          'updated_at'                => shift_timestamp(r.updated_at, shift_timestamps)&.iso8601
        }
        store_ref yml_response, r.id, :poll_response
        yml_response
      end
    end

    def yml_poll_response_options shift_timestamps: 0
      participation_context_ids = [@project.id] + @project.phases.ids
      Polls::ResponseOption.left_outer_joins(:response).where(polls_responses: {participation_context_id: participation_context_ids}).map do |r|
        yml_response_option = {
          'response_ref' => lookup_ref(r.response_id, :poll_option),
          'option_ref'   => lookup_ref(r.option_id, :poll_option),
          'created_at'   => shift_timestamp(r.created_at, shift_timestamps)&.iso8601,
          'updated_at'   => shift_timestamp(r.updated_at, shift_timestamps)&.iso8601
        }
        store_ref yml_response_option, r.id, :poll_response_option
        yml_response_option
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
          yml_user = service.anonymized_attributes Tenant.settings('core', 'locales'), user: u
          yml_user.delete 'custom_field_values'
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
            'registration_completed_at' => shift_timestamp(u.registration_completed_at, shift_timestamps)&.iso8601
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
          'project_ref'          => lookup_ref(e.project_id, :project),
          'title_multiloc'       => e.title_multiloc,
          'description_multiloc' => e.description_multiloc,
          'location_multiloc'    => e.location_multiloc,
          'start_at'             => shift_timestamp(e.start_at, shift_timestamps)&.iso8601,
          'end_at'               => shift_timestamp(e.end_at, shift_timestamps)&.iso8601,
          'created_at'           => shift_timestamp(e.created_at, shift_timestamps)&.iso8601,
          'updated_at'           => shift_timestamp(e.updated_at, shift_timestamps)&.iso8601
        }
        store_ref yml_event, e.id, :event
        yml_event
      end
    end

    def yml_event_files shift_timestamps: 0
      @project.events.flat_map(&:event_files).map do |e|
        {
          'event_ref'       => lookup_ref(e.event_id, :event),
          'remote_file_url' => e.file_url,
          'ordering'        => e.ordering,
          'created_at'      => shift_timestamp(e.created_at, shift_timestamps)&.iso8601,
          'updated_at'      => shift_timestamp(e.updated_at, shift_timestamps)&.iso8601,
          'name'            => e.name
        }
      end
    end

    def yml_permissions shift_timestamps: 0
      permittable_ids = [@project.id] + @project.phases.ids
      Permission.where(permittable_id: permittable_ids).map do |p|
        yml_permission = {
          'action'          => p.action,
          'permitted_by'    => p.permitted_by,
          'permittable_ref' => lookup_ref(p.permittable_id, [:project, :phase]),
          'created_at'      => shift_timestamp(p.created_at, shift_timestamps)&.iso8601,
          'updated_at'      => shift_timestamp(p.updated_at, shift_timestamps)&.iso8601
        }
        store_ref yml_permission, p.id, :permission
        yml_permission
      end
    end

    def yml_ideas shift_timestamps: 0
      @project.ideas.published.map do |i|
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
          'budget'                 => i.budget
        }
        store_ref yml_idea, i.id, :idea
        yml_idea
      end
    end

    def yml_baskets_ideas shift_timestamps: 0
      BasketsIdea.where(idea_id: @project.ideas.published.ids).map do |b|
        if lookup_ref(b.idea_id, :idea)
          {
            'basket_ref' => lookup_ref(b.basket_id, :basket),
            'idea_ref'   => lookup_ref(b.idea_id, :idea)
          }
        end.compact
      end
    end

    def yml_idea_files shift_timestamps: 0
      IdeaFile.where(idea_id: @project.ideas.published.ids).map do |i|
        {
          'idea_ref'        => lookup_ref(i.idea_id, :idea),
          'remote_file_url' => i.file_url,
          'ordering'        => i.ordering,
          'created_at'      => shift_timestamp(i.created_at, shift_timestamps)&.iso8601,
          'updated_at'      => shift_timestamp(i.updated_at, shift_timestamps)&.iso8601,
          'name'            => i.name
        }
      end
    end
        
    def yml_idea_images shift_timestamps: 0
      IdeaImage.where(idea_id: @project.ideas.published.ids).map do |i|
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
      IdeasPhase.where(idea_id: @project.ideas.published.ids).map do |i|
        {
          'idea_ref'   => lookup_ref(i.idea_id, :idea),
          'phase_ref'  => lookup_ref(i.phase_id, :phase),
          'created_at' => shift_timestamp(i.created_at, shift_timestamps)&.iso8601,
          'updated_at' => shift_timestamp(i.updated_at, shift_timestamps)&.iso8601
        }
      end
    end

    def yml_comments shift_timestamps: 0
      (Comment.where('parent_id IS NULL').where(post_id: @project.ideas.published.ids, post_type: 'Idea')+Comment.where('parent_id IS NOT NULL').where(post_id: @project.ideas.published.ids, post_type: 'Idea')).map do |c|
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
      OfficialFeedback.where(post_id: @project.ideas.published.ids, post_type: 'Idea').map do |o|
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
      idea_ids = @project.ideas.published.ids
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
