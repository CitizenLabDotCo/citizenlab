class WebApi::V1::FilesController < ApplicationController

  before_action :set_container, only: [:index, :create]
  before_action :set_file, only: [:show, :update, :destroy]
  skip_after_action :verify_policy_scoped

  def index
    @files = @container.send("#{container_association}_files").order(:ordering)
    policy_scope_class = "#{params['file_class'].name}Policy::Scope".constantize
    @files = policy_scope_class.new(current_user, @files).resolve
    render json: @files, each_serializer: WebApi::V1::FileSerializer
  end

  def show
    render json: @file, serializer: WebApi::V1::FileSerializer
  end

  def create
    @file = @container.send("#{container_association}_files").create(file_params)
    authorize @file
    if @file.save
      render json: @file, status: :created, serializer: WebApi::V1::FileSerializer
    else
      render json: {errors: transform_errors_details!(@file.errors.details)}, status: :unprocessable_entity
    end
  end

  def update
    if @file.update(file_params)
      render json: @file, status: :ok, serializer: WebApi::V1::FileSerializer
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

  def secure_controller?
    false
  end

  def file_params
    params.require(:file).permit(
      :file,
      :ordering
    )
  end

  def set_file
    @file = params['file_class'].find(params[:id])
    authorize @file
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
    error_details[:file] = error_details[:file]&.uniq{|e| e[:error]}
    error_details
  end
end
