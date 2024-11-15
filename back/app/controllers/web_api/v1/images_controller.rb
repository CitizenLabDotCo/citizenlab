# frozen_string_literal: true

class WebApi::V1::ImagesController < ApplicationController
  include CarrierwaveErrorDetailsTransformation

  CONSTANTIZER = {
    'Idea' => {
      container_class: Idea,
      image_class: IdeaImage,
      policy_scope_class: IdeaImagePolicy::Scope,
      image_relationship: :idea_images,
      container_id: :idea_id
    },
    'Event' => {
      container_class: Event,
      image_class: EventImage,
      policy_scope_class: EventImagePolicy::Scope,
      image_relationship: :event_images,
      container_id: :event_id
    },
    'Initiative' => {
      container_class: Initiative,
      image_class: InitiativeImage,
      policy_scope_class: InitiativeImagePolicy::Scope,
      image_relationship: :initiative_images,
      container_id: :initiative_id
    },
    'Project' => {
      container_class: Project,
      image_class: ProjectImage,
      policy_scope_class: ProjectImagePolicy::Scope,
      image_relationship: :project_images,
      container_id: :project_id
    },
    'ProjectFolder' => {
      container_class: ProjectFolders::Folder,
      image_class: ProjectFolders::Image,
      policy_scope_class: ProjectFolders::ImagePolicy::Scope,
      image_relationship: :images,
      container_id: :project_folder_id
    },
    'CustomFieldOption' => {
      container_class: CustomFieldOption,
      image_class: CustomFieldOptionImage,
      policy_scope_class: CustomFieldOptionImagePolicy::Scope,
      image_relationship: :image,
      container_id: :custom_field_option_id
    }
  }

  before_action :set_container, only: %i[index create]
  before_action :set_image, only: %i[show update destroy]
  skip_before_action :authenticate_user
  skip_after_action :verify_policy_scoped

  def index
    @images = @container.send(secure_constantize(:image_relationship)).order(:ordering)
    @images = secure_constantize(:policy_scope_class).new(pundit_user, @images).resolve
    render json: WebApi::V1::ImageSerializer.new(@images, params: jsonapi_serializer_params).serializable_hash
  end

  def show
    render json: WebApi::V1::ImageSerializer.new(@image, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    @image = if @container
      @container.send(secure_constantize(:image_relationship)).create(image_params)
    else
      secure_constantize(:image_class).new(image_params)
    end
    authorize @image
    if @image.save
      render json: WebApi::V1::ImageSerializer.new(
        @image,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      if @image.errors.details[:image].include?({ error: 'processing_error' })
        ErrorReporter.report_msg(@image.errors.details.to_s)
      end
      render json: { errors: transform_carrierwave_error_details(@image.errors, :image) }, status: :unprocessable_entity
    end
  end

  def update
    if @image.update(image_params)
      render json: WebApi::V1::ImageSerializer.new(
        @image,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: transform_carrierwave_error_details(@image.errors, :image) }, status: :unprocessable_entity
    end
  end

  def destroy
    image = @image.destroy
    if image.destroyed?
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def image_params
    permitted_attributes = %i[image ordering]
    if %w[Project ProjectFolder Event].include?(params[:container_type])
      permitted_attributes << { alt_text_multiloc: CL2_SUPPORTED_LOCALES }
    end
    params.require(:image).permit(permitted_attributes)
  end

  def set_image
    @image = secure_constantize(:image_class).find(params[:id])
    authorize @image
  end

  def set_container
    container_id = params[secure_constantize(:container_id)]
    @container = container_id ? secure_constantize(:container_class).find(container_id) : nil
  end

  def secure_constantize(key)
    CONSTANTIZER.fetch(params[:container_type])[key]
  end
end
