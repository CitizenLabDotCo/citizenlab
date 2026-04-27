# frozen_string_literal: true

class WebApi::V1::FoldersController < ApplicationController
  before_action :set_project_folder, only: %i[show update destroy]
  skip_before_action :authenticate_user

  def index
    @project_folders = policy_scope(ProjectFolders::Folder)
    @project_folders = @project_folders.where(id: params[:filter_ids]) if params[:filter_ids]

    @project_folders = paginate @project_folders
    @project_folders = @project_folders.includes(:images, admin_publication: [:children])

    user_followers = current_user&.follows
      &.where(followable_type: 'ProjectFolders::Folder')
      &.group_by do |follower|
        [follower.followable_id, follower.followable_type]
      end
    user_followers ||= {}

    render json: linked_json(
      @project_folders,
      WebApi::V1::FolderSerializer,
      params: jsonapi_serializer_params(
        visible_children_count_by_parent_id: visible_children_count_by_parent_id,
        user_followers: user_followers
      ),
      include: %i[admin_publication images]
    )
  end

  def index_for_admin
    project_folders = UserRoleService.new.moderatable_folders(current_user)
    authorize project_folders

    project_folders = FoldersFinderAdminService.execute(project_folders, params)
    project_folders = paginate project_folders
    project_folders = project_folders.includes(:admin_publication, :images)

    moderators_per_folder = UserRoleService.new.moderators_per_folder(
      project_folders.pluck(:id)
    )

    render json: linked_json(
      project_folders,
      WebApi::V1::FolderMiniSerializer,
      params: jsonapi_serializer_params(
        visible_children_count_by_parent_id: visible_children_count_by_parent_id,
        moderators_per_folder: moderators_per_folder
      ),
      include: %i[moderators images]
    )
  end

  def show
    render json: WebApi::V1::FolderSerializer.new(
      @project_folder,
      params: jsonapi_serializer_params,
      include: %i[admin_publication images]
    ).serializable_hash
  end

  def by_slug
    @project_folder = ProjectFolders::Folder.find_by!(slug: params[:slug])
    authorize @project_folder
    show
  end

  def create
    @project_folder = ProjectFolders::Folder.new(project_folder_params)
    authorize @project_folder

    if @project_folder.save
      sidefx.after_create(@project_folder, current_user)

      render json: WebApi::V1::FolderSerializer.new(
        @project_folder,
        params: jsonapi_serializer_params,
        include: [:admin_publication]
      ).serializable_hash, status: :created
    else
      render json: { errors: @project_folder.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    process_due_transition(@project_folder)
    @project_folder.assign_attributes project_folder_params
    authorize @project_folder
    remove_image_if_requested!(@project_folder, project_folder_params, :header_bg)

    if @project_folder.save
      sidefx.after_update(@project_folder, current_user)
      render json: WebApi::V1::FolderSerializer.new(
        @project_folder,
        params: jsonapi_serializer_params,
        include: [:admin_publication]
      ).serializable_hash, status: :ok
    else
      render json: { errors: @project_folder.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    frozen_folder = nil
    frozen_projects = nil

    process_due_transition(@project_folder)
    @project_folder.projects.each do |project|
      process_due_transition(project)
      SideFxProjectService.new.before_destroy(project, current_user)
    end

    ActiveRecord::Base.transaction do
      frozen_projects = @project_folder.projects.each(&:destroy!)
      frozen_folder = @project_folder.destroy
    end

    if frozen_folder.destroyed?
      sidefx.after_destroy(frozen_folder, current_user)
      frozen_projects.each do |project|
        SideFxProjectService.new.after_destroy(project, current_user)
      end
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def sidefx
    @sidefx ||= ProjectFolders::SideFxProjectFolderService.new
  end

  def process_due_transition(publication)
    admin_pub = publication.admin_publication
    return unless admin_pub.scheduled_at&.<=(Time.current)

    ProcessScheduledPublicationTransitionsJob.new.run(admin_pub)
  end

  def set_project_folder
    @project_folder = ProjectFolders::Folder.find(params[:id])
    authorize @project_folder
  end

  def project_folder_params
    @project_folder_params ||= begin
      attrs = policy(@project_folder || ProjectFolders::Folder.new).permitted_attributes

      params.require(:project_folder).permit(attrs).tap do |folder_params|
        admin_pub_attrs = folder_params[:admin_publication_attributes]
        assign_scheduled_by(admin_pub_attrs) if admin_pub_attrs
      end
    end
  end

  # Automatically set the scheduled_by_id according to the new scheduled status.
  def assign_scheduled_by(admin_publication_attrs)
    return unless admin_publication_attrs.key?(:scheduled_status)

    admin_publication_attrs[:scheduled_by_id] =
      admin_publication_attrs[:scheduled_status].present? ? current_user.id : nil
  end

  def visible_children_count_by_parent_id
    # Array of publication IDs for folders that
    # still have visible children left.
    parent_ids_for_visible_children = policy_scope(Project)
      .includes(:admin_publication)
      .pluck('admin_publications.parent_id')
      .compact

    # Caches the counts of visible children for
    # the current user.
    Hash.new(0).tap { |h| parent_ids_for_visible_children.each { |id| h[id] += 1 } }
  end
end

WebApi::V1::FoldersController.include(AggressiveCaching::Patches::WebApi::V1::FoldersController)
