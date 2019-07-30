class WebApi::V1::InitiativesController < ApplicationController

  before_action :set_initiative, only: [:show, :update, :destroy]
  skip_after_action :verify_authorized, only: [:index_xlsx, :index_initiative_markers, :filter_counts]
  
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  
  def index
    @initiatives = policy_scope(Initiative).includes(:author, :assignee, :topics, :areas)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @initiatives = PostsFilteringService.new.apply_common_initiative_index_filters @initiatives, params

    if params[:sort].present? && !params[:search].present?
      @initiatives = case params[:sort]
        when 'new'
          @initiatives.order_new
        when '-new'
          @initiatives.order_new(:asc)
        when 'author_name'
          @initiatives.order(author_name: :asc)
        when '-author_name'
          @initiatives.order(author_name: :desc)
        when 'upvotes_count'
          @initiatives.order(upvotes_count: :asc)
        when '-upvotes_count'
          @initiatives.order(upvotes_count: :desc)
        when 'status'
          @initiatives.order_status(:asc)
        when '-status'
          @initiatives.order_status(:desc)
        when 'random'
          @initiatives.order_random
        when nil
          @initiatives
        else
          raise 'Unsupported sort method'
        end
    end

    serialization_options = if current_user
      @initiative_ids = @initiatives.map(&:id)
      votes = Vote.where(user: current_user, votable_id: @initiative_ids, votable_type: 'Initiative')
      votes_by_initiative_id = votes.map{|vote| [vote.votable_id, vote]}.to_h
      {
        params: fastjson_params(vbii: votes_by_initiative_id, pcs: ParticipationContextService.new),
        include: [:author, :user_vote, :initiative_images, :assignee]
      }
    else
      {
        params: fastjson_params(pcs: ParticipationContextService.new),
        include: [:author, :initiative_images]
      }
    end

    render json: linked_json(@initiatives, WebApi::V1::InitiativeSerializer, serialization_options)
  end

  def index_initiative_markers
    @initiatives = policy_scope(Initiative)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @initiatives = PostsFilteringService.new.apply_common_initiative_index_filters @initiatives, params
    @initiatives = @initiatives.with_bounding_box(params[:bounding_box]) if params[:bounding_box].present?

    render json: linked_json(@initiatives, WebApi::V1::PostMarkerSerializer, params: fastjson_params)
  end

  def index_xlsx
    I18n.with_locale(current_user&.locale) do
      @initiatives = policy_scope(Initiative)
        .includes(:author, :topics, :areas)
        .join_initiative_status
        .where(publication_status: 'published')
      @initiatives = @initiatives.where(id: params[:initiatives]) if params[:initiatives].present?
      xlsx = XlsxService.new.generate_initiatives_xlsx @initiatives
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'initiatives.xlsx'
    end
  end

  def filter_counts
    @initiatives = policy_scope(Initiative)
    @initiatives = PostsFilteringService.new.apply_common_initiative_index_filters @initiatives, params
    counts = {
      'initiative_status_id' => {},
      'area_id' => {},
      'topic_id' => {}
    } 
    grouping_sets = ActiveRecord::Base.connection.execute("""
      SELECT initiative_statuses.id AS initiative_status_id, areas_initiatives.area_id, initiatives_topics.topic_id, COUNT(DISTINCT(initiatives.id)) AS count
      FROM initiatives
      INNER JOIN (
              SELECT initiative_id, max(initiative_status_changes.created_at) AS last_status_changed_at 
              FROM initiative_status_changes 
              GROUP BY initiative_status_changes.initiative_id
              ) AS aardvark 
            ON initiatives.id = aardvark.initiative_id
      INNER JOIN initiative_status_changes ON initiatives.id = initiative_status_changes.initiative_id AND last_status_changed_at = initiative_status_changes.created_at
      INNER JOIN initiative_statuses ON initiative_statuses.id = initiative_status_changes.initiative_status_id
      FULL OUTER JOIN initiatives_topics ON initiatives_topics.initiative_id = initiatives.id
      FULL OUTER JOIN areas_initiatives ON areas_initiatives.initiative_id = initiatives.id
      WHERE initiatives.id IN (#{@initiatives.ids.map{|id| "'#{id}'"}.join ', '})
      GROUP BY GROUPING SETS (initiative_statuses.id, areas_initiatives.area_id, initiatives_topics.topic_id)
      """)
    grouping_sets.each do |record|
      %w(initiative_status_id area_id topic_id).each do |attribute|
        id = record[attribute]
        counts[attribute][id] = record['count'] if id
      end
    end
    counts['total'] = @initiatives.count
    render json: counts
  end

  def show
    render json: WebApi::V1::InitiativeSerializer.new(
      @initiative, 
      params: fastjson_params, 
      include: [:author, :topics, :areas, :user_vote, :initiative_images]
      ).serialized_json
  end

  def by_slug
    @initiative = Initiative.find_by!(slug: params[:slug])
    authorize @initiative
    show
  end

  def create
    service = SideFxInitiativeService.new

    @initiative = Initiative.new(permitted_attributes(Initiative))
    @initiative.author ||= current_user

    service.before_create(@initiative, current_user)

    authorize @initiative
    ActiveRecord::Base.transaction do
      if @initiative.save
        service.after_create(@initiative, current_user)
        render json: WebApi::V1::InitiativeSerializer.new(
          @initiative.reload, 
          params: fastjson_params, 
          include: [:author, :topics, :areas, :user_vote, :initiative_images]
          ).serialized_json, status: :created
      else
        render json: { errors: @initiative.errors.details }, status: :unprocessable_entity
      end

    end
  end

  def update
    service = SideFxInitiativeService.new

    initiative_params = permitted_attributes(@initiative)
    @initiative.assign_attributes(initiative_params)
    if initiative_params.keys.include?('header_bg') && initiative_params['header_bg'] == nil
      # setting the header image attribute to nil will not remove the header image
      @initiative.remove_header_bg!
    end
    authorize @initiative

    service.before_update(@initiative, current_user)
    ActiveRecord::Base.transaction do
      if @initiative.save
        authorize @initiative
        service.after_update(@initiative, current_user)
        render json: WebApi::V1::InitiativeSerializer.new(
          @initiative.reload, 
          params: fastjson_params, 
          include: [:author, :topics, :areas, :user_vote, :initiative_images]
          ).serialized_json, status: :ok
      else
        render json: { errors: @initiative.errors.details }, status: :unprocessable_entity
      end
    end 
  end

  def destroy
    service = SideFxInitiativeService.new
    
    service.before_destroy(@initiative, current_user)
    initiative = @initiative.destroy
    if initiative.destroyed?
      service.after_destroy(initiative, current_user)
      head :ok
    else
      head 500
    end
  end


  private

  def secure_controller?
    false
  end

  def set_initiative
    @initiative = Initiative.find params[:id]
    authorize @initiative
  end

end
