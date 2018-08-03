class WebApi::V1::ImagesController < ApplicationController

  before_action :set_image, only: [:show, :update, :destroy]
  skip_after_action :verify_policy_scoped

  def index
    container_id = params["#{container_association}_id"]
    container = params['container_class'].find(container_id)
    @images = container.send("#{container_association}_images").order(:ordering)
    policy_scope_class = "#{params['image_class'].name}Policy::Scope".constantize
    @images = policy_scope_class.new(user, @images).resolve
    render json: @images, each_serializer: WebApi::V1::ImageSerializer
  end

  def show
    render json: @image, serializer: WebApi::V1::ImageSerializer
  end

  def create
    @image = params['image_class'].new(image_params)
    authorize @image
    if @image.save
      render json: @image, status: :created, serializer: WebApi::V1::ImageSerializer
    else
      render json: {errors: transform_errors_details!(@image.errors.details)}, status: :unprocessable_entity
    end
  end

  def update
    if @image.update(image_params)
      render json: @image, status: :ok, serializer: WebApi::V1::ImageSerializer
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
    authorize @image
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