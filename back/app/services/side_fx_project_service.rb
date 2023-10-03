# frozen_string_literal: true

class SideFxProjectService
  include SideFxHelper

  def initialize(sfx_pc = SideFxParticipationContextService.new)
    @sfx_pc = sfx_pc
  end

  def before_create(project, user)
    @sfx_pc.before_create project, user if project.participation_context?
  end

  def after_create(project, user)
    participation_method = Factory.instance.participation_method_for(project)
    participation_method.create_default_form! if participation_method.auto_create_default_form?
    project.set_default_topics!
    project.update!(description_multiloc: TextImageService.new.swap_data_images(project, :description_multiloc))

    LogActivityJob.perform_later(project, 'created', user, project.created_at.to_i)

    @sfx_pc.after_create project, user if project.participation_context?
    after_publish project, user if project.admin_publication.published?
  end

  def after_copy(source_project, copied_project, user, start_time)
    LogActivityJob.perform_later(
      copied_project,
      'local_copy_created',
      user,
      copied_project.created_at.to_i,
      payload: {
        time_taken: Time.now - start_time,
        source_project_id: source_project.id,
        copied_project_attributes: copied_project.attributes
      }
    )
  end

  def before_update(project, user)
    @publication_status_was = project.admin_publication.publication_status
    @folder_id_was = project.admin_publication.parent_id_was
    project.description_multiloc = TextImageService.new.swap_data_images(project, :description_multiloc)
    @sfx_pc.before_update project, user if project.participation_context?
  end

  def after_update(project, user)
    LogActivityJob.perform_later project, 'changed', user, project.updated_at.to_i
    %i[
      description_multiloc voting_method voting_max_votes_per_idea voting_max_total voting_min_total
      posting_enabled posting_method posting_limited_max commenting_enabled reacting_enabled
      reacting_like_method reacting_like_limited_max reacting_dislike_enabled presentation_mode
    ].each do |attribute|
      if project.send "#{attribute}_previously_changed?"
        LogActivityJob.perform_later(
          project,
          "changed_#{attribute}",
          user,
          project.updated_at.to_i,
          payload: { change: project.send("#{attribute}_previous_change") }
        )
      end
    end

    after_folder_changed project, user if @folder_id_was != project.folder_id
    @sfx_pc.after_update project, user if project.participation_context?
    # We don't want to send out the "project published" campaign when e.g. changing from "archived" to "published"
    after_publish project, user if project.admin_publication.published? && @publication_status_was == 'draft'
  end

  def before_destroy(project, user)
    @sfx_pc.before_destroy project, user if project.participation_context?
  end

  def after_destroy(frozen_project, user)
    serialized_project = clean_time_attributes(frozen_project.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_project), 'deleted',
      user, Time.now.to_i,
      payload: { project: serialized_project }
    )
    @sfx_pc.after_destroy frozen_project, user if frozen_project.participation_context?
  end

  def before_delete_inputs(project, user); end

  def after_delete_inputs(project, user)
    LogActivityJob.perform_later project, 'inputs_deleted', user, Time.now.to_i
  end

  private

  def after_publish(project, user)
    LogActivityJob.perform_later project, 'published', user, project.updated_at.to_i
  end

  def after_folder_changed(project, current_user)
    # Defined in core app to eliminate dependency between
    # idea assignment and folder engine.
  end
end

SideFxProjectService.prepend(IdeaAssignment::Patches::SideFxProjectService)
