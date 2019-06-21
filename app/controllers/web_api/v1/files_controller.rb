class WebApi::V1::FilesController < ApplicationController

  before_action :set_container, only: [:index, :create]
  before_action :set_file, only: [:show, :update, :destroy]
  skip_after_action :verify_policy_scoped

  def index
    @files = @container.send("#{container_association}_files").order(:ordering)
    policy_scope_class = "#{params['file_class_name']}Policy::Scope".constantize
    @files = policy_scope_class.new(current_user, @files).resolve
    render json: WebApi::V1::Fast::FileSerializer.new(@files, params: fastjson_params).serialized_json
  end

  def show
    render json: WebApi::V1::Fast::FileSerializer.new(@file, params: fastjson_params).serialized_json
  end

  def create
    @file = @container.send("#{container_association}_files").create(file_params)
    authorize @file
    if @file.save
      render json: WebApi::V1::Fast::FileSerializer.new(
        @file, 
        params: fastjson_params
        ).serialized_json, status: :created
    else
      render json: {errors: transform_errors_details!(@file.errors.details)}, status: :unprocessable_entity
    end
  end

  def update
    if @file.update(file_params)
      render json: WebApi::V1::Fast::FileSerializer.new(
        @file, 
        params: fastjson_params
        ).serialized_json, status: :ok
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
      :ordering,
      :name
    )
  end

  def set_file
    file_class = params['file_class_name'].constantize
    @file = file_class.find(params[:id])
    authorize @file
  end

  def set_container
    container_id = params["#{container_association}_id"]
    container_class = params['container_class_name'].constantize
    @container = container_class.find(container_id)
  end

  def container_association
    params['container_class_name'].downcase
  end

   def transform_errors_details! error_details
    # carrierwave does not return the error code symbols by default
    error_details[:file] = error_details[:file]&.uniq{|e| e[:error]}
    error_details
  end
end
