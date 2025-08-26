# frozen_string_literal: true

class WebApi::V1::Files::FilesController < ApplicationController
  include CarrierwaveErrorDetailsTransformation

  def index
    files =
      Files::FileFinder.new(**finder_params).execute
        .then { |scope| scope.includes(:preview) }
        .then { |scope| scope.order(**order_params) }
        .then { policy_scope(_1) }
        .then { paginate(_1) }

    render json: linked_json(
      files,
      WebApi::V1::FileV2Serializer,
      params: jsonapi_serializer_params,
      include: [:preview]
    )
  end

  def show
    file = authorize(Files::File.find(params[:id]))

    render json: WebApi::V1::FileV2Serializer.new(
      file,
      params: jsonapi_serializer_params,
      include: [:preview]
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

  def update
    file = authorize(Files::File.find(params[:id]))

    side_fx.before_update(file, current_user)
    if file.update(update_params)
      side_fx.after_update(file, current_user)
      render json: WebApi::V1::FileV2Serializer.new(
        file,
        params: jsonapi_serializer_params
      ).serializable_hash
    else
      render json: { errors: file.errors.details }, status: :unprocessable_entity
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
    params.require(:file).permit(
      :category,
      :ai_processing_allowed,
      description_multiloc: CL2_SUPPORTED_LOCALES
    ).tap do |create_params|
      create_params[:content_by_content] = params.require(:file).permit(:content, :name)
      create_params[:uploader_id] = current_user.id

      # Optional initial attachment
      attachable_id = params.dig(:file, :attachable_id)
      attachable_type = params.dig(:file, :attachable_type)

      if attachable_id.present? && attachable_type.present?
        create_params[:attachments_attributes] = [{ attachable_id:, attachable_type: }]
      end
    end
  end

  def update_params
    params.require(:file).permit(
      :name,
      :category,
      :ai_processing_allowed,
      description_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

  def finder_params
    params.permit(
      :search,
      :exclude_idea_files,
      :uploader, :project, :category,
      uploader: [], project: [], category: []
    ).to_h.symbolize_keys.tap do |it|
      it[:exclude_idea_files] = parse_bool(it[:exclude_idea_files]) if it.key?(:exclude_idea_files)
    end
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
