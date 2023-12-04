# frozen_string_literal: true

class WebApi::V1::FilesController < ApplicationController
  skip_before_action :authenticate_user

  CONSTANTIZER = {
    'Idea' => {
      container_class: Idea,
      file_class: IdeaFile,
      policy_scope_class: IdeaFilePolicy::Scope,
      file_relationship: :idea_files,
      container_id: :idea_id
    },
    'Initiative' => {
      container_class: Initiative,
      file_class: InitiativeFile,
      policy_scope_class: InitiativeFilePolicy::Scope,
      file_relationship: :initiative_files,
      container_id: :initiative_id
    },
    'Project' => {
      container_class: Project,
      file_class: ProjectFile,
      policy_scope_class: ProjectFilePolicy::Scope,
      file_relationship: :project_files,
      container_id: :project_id
    },
    'ProjectFolder' => {
      container_class: ProjectFolders::Folder,
      file_class: ProjectFolders::File,
      policy_scope_class: ProjectFolders::FilePolicy::Scope,
      file_relationship: :files,
      container_id: :project_folder_id
    },
    'Event' => {
      container_class: Event,
      file_class: EventFile,
      policy_scope_class: EventFilePolicy::Scope,
      file_relationship: :event_files,
      container_id: :event_id
    },
    'Phase' => {
      container_class: Phase,
      file_class: PhaseFile,
      policy_scope_class: PhaseFilePolicy::Scope,
      file_relationship: :phase_files,
      container_id: :phase_id
    },
    'StaticPage' => {
      container_class: StaticPage,
      file_class: StaticPageFile,
      policy_scope_class: StaticPageFilePolicy::Scope,
      file_relationship: :static_page_files,
      container_id: :static_page_id
    }
  }

  before_action :set_container, only: %i[index create]
  before_action :set_file, only: %i[show destroy]
  skip_after_action :verify_policy_scoped

  def index
    @files = @container.send(secure_constantize(:file_relationship)).order(:ordering)
    @files = secure_constantize(:policy_scope_class).new(current_user, @files).resolve
    render json: WebApi::V1::FileSerializer.new(@files, params: jsonapi_serializer_params).serializable_hash
  end

  def show
    render json: WebApi::V1::FileSerializer.new(@file, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    @file = @container.send(secure_constantize(:file_relationship)).new file_params
    authorize @file
    if @file.save
      render json: WebApi::V1::FileSerializer.new(
        @file,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: generate_error_details(@file.errors) }, status: :unprocessable_entity
    end
  end

  def destroy
    file = @file.destroy
    if file.destroyed?
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def file_params
    params_of_file = params.require(:file).permit(
      :file,
      :ordering,
      :name
    )
    returned_file_params = {}
    if params_of_file[:file] || params_of_file[:name]
      returned_file_params[:file_by_content] = {
        content: params_of_file[:file],
        name: params_of_file[:name]
      }
    end
    returned_file_params[:ordering] ||= params_of_file[:ordering]
    returned_file_params
  end

  def set_file
    @file = secure_constantize(:file_class).find params[:id]
    authorize @file
  end

  def set_container
    container_id = params[secure_constantize(:container_id)]
    @container = secure_constantize(:container_class).find container_id
  end

  def generate_error_details(errors)
    # @file.errors.details always returns { error: ActiveModel::Error#type }
    # But Carrierwave's ActiveModel::Error items sometimes have more specific messages (e.g., max_size_error in this case).
    # We want to use these specific messages on the FE.
    #
    # > @file.errors
    # => #<ActiveModel::Errors [
    #  #<ActiveModel::Error attribute=file, type=carrierwave_integrity_error, options={:message=>"max_size_error"}>,
    #  #<ActiveModel::Error attribute=file, type=blank, options={:unless=>#<Proc:0x0000558d8a77ac00 /cl2_back/app/models/project_file.rb:30>}>
    # ]>
    error_details = errors.each_with_object(Hash.new { [] }) do |error, obj|
      obj[error.attribute] += [{ error: error.options[:message] || error.type }]
    end
    # carrierwave does not return the error code symbols by default
    error_details[:file] = error_details[:file]&.uniq { |e| e[:error] }
    error_details
  end

  def secure_constantize(key)
    CONSTANTIZER.fetch(params[:container_type])[key]
  end
end
