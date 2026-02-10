# frozen_string_literal: true

class WebApi::V1::AreasController < ApplicationController
  before_action :set_area, except: %i[index create with_visible_projects_counts]
  before_action :set_side_effects_service, only: %i[create update reorder destroy]
  skip_before_action :authenticate_user, only: %i[index show with_visible_projects_counts]

  def index
    areas_filterer = AreasFilteringService.new
    @areas = policy_scope(Area)
    @areas = areas_filterer.filter(@areas, params: params, current_user: current_user)
    @areas =
      case params[:sort]
      when 'projects_count'
        @areas.order_projects_count
      when '-projects_count'
        @areas.order_projects_count(:asc)
      else
        @areas.order(:ordering)
      end
    @areas = paginate @areas

    include_static_pages = params[:include]&.split(',')&.include?('static_pages')
    user_followers = current_user&.follows
      &.where(followable_type: 'Area')
      &.group_by do |follower|
        [follower.followable_id, follower.followable_type]
      end
    user_followers ||= {}

    if include_static_pages
      render json: linked_json(
        @areas.includes([static_pages: :nav_bar_item]),
        WebApi::V1::AreaSerializer,
        include: [:static_pages],
        params: jsonapi_serializer_params(include_static_pages: true, user_followers: user_followers)
      )
      return
    end

    render json: linked_json(@areas, WebApi::V1::AreaSerializer, params: jsonapi_serializer_params(user_followers: user_followers))
  end

  def show
    render json: WebApi::V1::AreaSerializer.new(@area, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    @area = Area.new(area_params)
    authorize @area

    @side_fx_service.before_create(@area, current_user)
    if @area.save
      @side_fx_service.after_create(@area, current_user)
      render json: WebApi::V1::AreaSerializer.new(
        @area,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: @area.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @area.assign_attributes area_params
    authorize @area
    @side_fx_service.before_update(@area, current_user)
    if @area.save
      @side_fx_service.after_update(@area, current_user)
      render json: WebApi::V1::AreaSerializer.new(
        @area,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @area.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    @side_fx_service.before_update(@area, current_user)
    if @area.insert_at(permitted_attributes(@area)[:ordering])
      @side_fx_service.after_update(@area, current_user)
      render json: WebApi::V1::AreaSerializer.new(@area.reload, params: jsonapi_serializer_params).serializable_hash, status: :ok
    else
      render json: { errors: @area.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    @side_fx_service.before_destroy(@area, current_user)
    if @area.destroy
      @side_fx_service.after_destroy(@area, current_user)
      head :ok
    else
      render json: { errors: @area.errors.details }, status: :unprocessable_entity
    end
  end

  # Index-like action, that returns all areas, along with an additional `visible_projects_count` attribute.
  # The `visible_projects_count` attribute is calculated by considering the number of associated projects
  # and projects with `include_all_areas: true`, in the subset of projects that are visible to the user.
  # It orders the areas firstly by the number of visible projects, secondly by their `ordering` value.
  def with_visible_projects_counts
    authorize :area, :with_visible_projects_counts?

    projects = policy_scope(Project).not_draft
    all_areas_project_count = projects.where(include_all_areas: true).count

    areas = policy_scope(Area)
      .left_joins(:areas_projects)
      .joins("LEFT JOIN (#{projects.select(:id).to_sql}) AS filtered_projects " \
             'ON filtered_projects.id = areas_projects.project_id')
      .group('areas.id')
      .select('areas.*', "COUNT(DISTINCT filtered_projects.id) + #{all_areas_project_count} AS visible_projects_count")
      .order('visible_projects_count DESC, areas.ordering ASC')

    areas = paginate areas

    render json: linked_json(
      areas,
      WebApi::V1::AreaSerializer,
      params: jsonapi_serializer_params(
        counts_of_visible_projects_by_area: areas.map { |area| { id: area.id, count: area.visible_projects_count } }
      )
    )
  end

  private

  def set_area
    @area = Area.find(params[:id])
    authorize @area
  end

  def area_params
    params.require(:area).permit(
      :include_in_onboarding,
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

  def set_side_effects_service
    @side_fx_service = SideFxAreaService.new
  end
end

WebApi::V1::AreasController.include(AggressiveCaching::Patches::WebApi::V1::AreasController)
