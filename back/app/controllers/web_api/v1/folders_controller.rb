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
    project_folders = policy_scope(ProjectFolders::Folder)
    project_folders = FoldersFinderAdminService.execute(project_folders, params)
    project_folders = paginate project_folders
    project_folders = project_folders.includes(:admin_publication)

    authorize project_folders

    moderators_per_folder = User
      .where("roles @> '[{\"type\":\"project_folder_moderator\"}]'")
      .each_with_object({}) do |user, hash|
        user.roles.each do |role|
          next unless role['type'] == 'project_folder_moderator'

          folder_id = role['project_folder_id']
          next unless folder_id

          hash[folder_id] ||= []
          hash[folder_id] << user
        end
      end

    render json: linked_json(
      project_folders,
      WebApi::V1::FolderMiniSerializer,
      params: jsonapi_serializer_params(
        visible_children_count_by_parent_id: visible_children_count_by_parent_id,
        moderators_per_folder: moderators_per_folder
      ),
      include: [:moderators]
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
      ProjectFolders::SideFxProjectFolderService.new.after_create(@project_folder, current_user)

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
    @project_folder.assign_attributes project_folder_params
    authorize @project_folder
    remove_image_if_requested!(@project_folder, project_folder_params, :header_bg)

    ProjectFolders::SideFxProjectFolderService.new.before_update(@project_folder, current_user)
    if @project_folder.save
      ProjectFolders::SideFxProjectFolderService.new.after_update(@project_folder, current_user)
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

    @project_folder.projects.each do |project|
      SideFxProjectService.new.before_destroy(project, current_user)
    end

    ActiveRecord::Base.transaction do
      frozen_projects = @project_folder.projects.each(&:destroy!)
      frozen_folder = @project_folder.destroy
    end

    if frozen_folder.destroyed?
      ProjectFolders::SideFxProjectFolderService.new.after_destroy(frozen_folder, current_user)
      frozen_projects.each do |project|
        SideFxProjectService.new.after_destroy(project, current_user)
      end
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_project_folder
    @project_folder = ProjectFolders::Folder.find(params[:id])
    authorize @project_folder
  end

  def project_folder_params
    params.require(:project_folder).permit(
      :header_bg,
      :slug,
      admin_publication_attributes: [:publication_status],
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES,
      description_preview_multiloc: CL2_SUPPORTED_LOCALES,
      header_bg_alt_text_multiloc: CL2_SUPPORTED_LOCALES
    )
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
