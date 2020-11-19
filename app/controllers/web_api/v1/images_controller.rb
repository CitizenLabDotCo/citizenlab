class WebApi::V1::ImagesController < ApplicationController

  CONSTANTIZER = {
    'Idea' => {
      container_class: Idea,
      image_class: IdeaImage,
      policy_scope_class: IdeaImagePolicy::Scope,
      image_relationship: :idea_images,
      container_id: :idea_id
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
    }
  }

  before_action :set_container, only: [:index, :create]
  before_action :set_image, only: [:show, :update, :destroy]
  skip_after_action :verify_policy_scoped

  def index
    @images = @container.send(secure_constantize(:image_relationship)).order(:ordering)
    @images = secure_constantize(:policy_scope_class).new(current_user, @images).resolve
    render json: WebApi::V1::ImageSerializer.new(@images, params: fastjson_params).serialized_json
  end

  def show
    render json: WebApi::V1::ImageSerializer.new(@image, params: fastjson_params).serialized_json
  end

  def create
    @image = @container.send(secure_constantize(:image_relationship)).create(image_params)
    authorize @image
    if @image.save
      render json: WebApi::V1::ImageSerializer.new(
        @image,
        params: fastjson_params
        ).serialized_json, status: :created
    else
      if @image.errors.details[:image].include?({error: 'processing_error'})
        Raven.capture_exception Exception.new(@image.errors.details.to_s)
      end
      render json: {errors: transform_errors_details!(@image.errors.details)}, status: :unprocessable_entity
    end
  end

  def update
    if @image.update(image_params)
      render json: WebApi::V1::ImageSerializer.new(
        @image,
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: {errors: transform_errors_details!(@image.errors.details)}, status: :unprocessable_entity
    end
  end

  def destroy
    image = @image.destroy
    if image.destroyed?
      head :ok
    else
      head 500
    end
  end

  # todo: move this to a service?
  #
  # @param [String] container_type
  # @param [Class] container_class
  # @param [Class] image_class
  # @param [Class] policy_scope_class
  # @param [Symbol] image_relationship
  # @param [Symbol] container_id
  # @return [void]
  def self.register_container(container_type, container_class, image_class, policy_scope_class, image_relationship, container_id)
    CONSTANTIZER[container_type] = {
        container_class: container_class,
        image_class: image_class,
        policy_scope_class: policy_scope_class,
        image_relationship: image_relationship,
        container_id: container_id
    }
  end

  private

  def secure_controller?
    false
  end

  def image_params
    params.require(:image).permit(
      :image,
      :ordering
    )
  end

  def set_image
    @image = secure_constantize(:image_class).find(params[:id])
    authorize @image
  end

  def set_container
    container_id = params[secure_constantize(:container_id)]
    @container = secure_constantize(:container_class).find(container_id)
  end

  def transform_errors_details! error_details
    # carrierwave does not return the error code symbols by default
    error_details[:image] = error_details[:image]&.uniq{|e| e[:error]}
    error_details
  end

  def secure_constantize key
    CONSTANTIZER.fetch(params[:container_type])[key]
  end
end
