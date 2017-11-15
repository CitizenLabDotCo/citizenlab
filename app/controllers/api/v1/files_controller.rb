class Api::V1::FilesController < ApplicationController
  before_action :set_container
  before_action :set_file, only: [:show, :update, :destroy]
  skip_after_action :verify_policy_scoped

  def index
    authorize @container, :files_index?
    @files = @container.send("#{container_association}_files").order(:ordering)
    render json: @files, each_serializer: Api::V1::FileSerializer
  end

  def show
    render json: @file, serializer: Api::V1::FileSerializer
  end

  def create
    authorize @container
    @file = @container.send("#{container_association}_files").create(file_params)
    if @file.save
      render json: @file, status: :created, serializer: Api::V1::FileSerializer
    else
      render json: {errors: transform_errors_details!(@file.errors.details)}, status: :unprocessable_entity
    end
  end

  def update
    if @file.update(file_params)
      render json: @file, status: :ok, serializer: Api::V1::FileSerializer
    else
      render json: {errors: transform_errors_details!(@file.errors.details)}, status: :unprocessable_entity
    end
  end

  def destroy
    file = @file.destroy
    if file.destroyed?
      head :ok
    else
      head 500
    end
  end

  private

  def transform_errors_details! error_details
    # carrierwave does not return the error code symbols by default
    error_details[:file] = error_details[:file]&.uniq{|e| e[:error]}
    error_details
  end

  def secure_controller?
    false
  end

  def file_params
    params.require(:file).permit(
      :file,
      :ordering,
      "#{container_association}_id".to_sym
    )
  end

  def set_file
    @file = params['file_class'].find(params[:id])
    authorize @container
  end

  def set_container
    container_id = params["#{container_association}_id"]
    @container = params['container_class'].find(container_id)
  end

  def container_association
    params['container_class'].name.downcase
  end
end
