class Api::V1::ImagesController < ApplicationController

  before_action :set_container
  before_action :set_image, only: [:show, :update, :destroy]
  skip_after_action :verify_policy_scoped

  def index
    authorize @container, :images_index?
    @images = @container.send("#{container_association}_images").order(:ordering)
    render json: @images, each_serializer: Api::V1::ImageSerializer
  end

  def show
    render json: @image, serializer: Api::V1::ImageSerializer
  end

  def create
    authorize @container
    @image = @container.send("#{container_association}_images").create(image_params)
    if @image.save
      render json: @image, status: :created, serializer: Api::V1::ImageSerializer
    else
      render json: {errors: transform_errors_details!(@image.errors.details)}, status: :unprocessable_entity
    end
  end

  def update
    if @image.update(image_params)
      render json: @image, status: :ok, serializer: Api::V1::ImageSerializer
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

  private

  def secure_controller?
    false
  end

  def image_params
    params.require(:image).permit(
      :image,
      :ordering,
      "#{container_association}_id".to_sym
    )
  end

  def set_image
    @image = params['image_class'].find(params[:id])
    authorize @container
  end

  def set_container
    container_id = params["#{container_association}_id"]
    @container = params['container_class'].find(container_id)
  end

  def container_association
    params['container_class'].name.downcase
  end

  def transform_errors_details! error_details
    # carrierwave does not return the error code symbols by default
    error_details[:image] = error_details[:image]&.uniq{|e| e[:error]}
    error_details
  end
end