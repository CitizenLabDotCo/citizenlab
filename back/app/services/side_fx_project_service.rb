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
    participation_method.create_default_form!
    project.set_default_topics!
    project.update!(description_multiloc: TextImageService.new.swap_data_images(project, :description_multiloc))

    LogActivityJob.perform_later(project, 'created', user, project.created_at.to_i)
    log_publication_status_change(project, user, change: [nil, project.admin_publication.publication_status])

    @sfx_pc.after_create project, user if project.participation_context?
  end

  def after_copy(source_project, copied_project)
    copy_project_and_phases_groups_permissions(source_project, copied_project)
  end

  def before_update(project, user)
    @folder_id_was = project.admin_publication.parent_id_was
    project.description_multiloc = TextImageService.new.swap_data_images(project, :description_multiloc)
    @sfx_pc.before_update project, user if project.participation_context?
  end

  def after_update(project, user)
    LogActivityJob.perform_later project, 'changed', user, project.updated_at.to_i
    log_publication_status_change(project, user)

    after_folder_changed project, user if @folder_id_was != project.folder_id
    @sfx_pc.after_update project, user if project.participation_context?
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

  # @param [Project] project
  # @param [User] user
  # @param [Array<String>,nil] change
  def log_publication_status_change(project, user, change: nil)
    change ||= project.admin_publication.publication_status_previous_change
    return unless change

    LogActivityJob
      .set(wait: 20.seconds)
      .perform_later(project, change.last, user, Time.now.to_i, payload: change)
  end

  def after_folder_changed(project, current_user)
    # Defined in core app to eliminate dependency between
    # idea assignment and folder engine.
  end
end

def copy_project_and_phases_groups_permissions(source_project, copied_project)
  # Copy groups_permissions of non-timeline project
  copy_groups_permissions(source_project, copied_project)

  # Copy groups_permissions of phases of timeline project
  source_phases = source_project.phases.order(:start_at)
  copied_phases = copied_project.phases.order(:start_at)

  source_phases.each_with_index do |phase, index|
    copy_groups_permissions(phase, copied_phases[index])
  end
end

def copy_groups_permissions(source_object, copied_object)
  source_object.permissions.each do |permission|
    next unless permission.permitted_by == 'groups'

    copied_permission = copied_object.permissions.where(action: permission.action).first
    next unless copied_permission

    permission.groups.each do |group|
      GroupsPermission.create(permission_id: copied_permission.id, group_id: group.id)
    end
  end
end

SideFxProjectService.prepend_if_ee 'IdeaAssignment::Patches::SideFxProjectService'
