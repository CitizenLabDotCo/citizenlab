# frozen_string_literal: true

class WebApi::V1::FilesV2Controller < ApplicationController
  include CarrierwaveErrorDetailsTransformation

  def index
    files =
      Files::FileFinder.new(**finder_params).execute
        .then { |scope| scope.order(**order_params) }
        .then { policy_scope(_1) }
        .then { paginate(_1) }

    render json: linked_json(
      files,
      WebApi::V1::FileV2Serializer,
      params: jsonapi_serializer_params
    )
  end

  def show
    file = authorize(Files::File.find(params[:id]))

    render json: WebApi::V1::FileV2Serializer.new(
      file,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  def create
    file = Files::File.new(create_params)
    file.files_projects.build(project_id: params[:file][:project])
    authorize(file)

    side_fx.before_create(file, current_user)
    if file.save
      side_fx.after_create(file, current_user)
      render json: WebApi::V1::FileV2Serializer.new(
        file,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: transform_carrierwave_error_details(file.errors, :content) }, status: :unprocessable_entity
    end
  end

  def destroy
    file = authorize(Files::File.find(params[:id]))

    side_fx.before_destroy(file, current_user)
    file.destroy!
    side_fx.after_destroy(file, current_user)

    head :no_content
  end

  private

  def create_params
    {
      content_by_content: params.require(:file).permit(:content, :name),
      uploader_id: current_user.id
    }
  end

  def finder_params
    params.permit(
      :uploader, :project,
      uploader: [], project: []
    ).to_h.symbolize_keys
  end

  def order_params
    sort = params[:sort].to_s.split(',').presence || ['-created_at']
    attr_names = %w[created_at name size]

    order_params = sort.to_h do |sort_value|
      direction = sort_value.start_with?('-') ? :desc : :asc
      attr_name = sort_value.delete_prefix('-')
      [attr_name, direction]
    end

    unsupported_attrs = order_params.keys - attr_names
    raise "Unsupported sort attribute(s): #{unsupported_attrs.join(', ')}" if unsupported_attrs.present?

    order_params
  end

  def side_fx
    @side_fx ||= Files::SideFxFileService.new
  end
end
