# frozen_string_literal: true

class WebApi::V1::InitiativesController < ApplicationController
  include BlockingProfanity

  before_action :set_initiative, only: %i[show update destroy allowed_transitions]
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized, only: %i[index_xlsx index_initiative_markers filter_counts]

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def index
    initiatives = InitiativesFinder.new(
      params,
      current_user: current_user,
      scope: policy_scope(Initiative),
      includes: %i[author assignee topics areas]
    ).find_records
    render json: linked_json(initiatives, WebApi::V1::InitiativeSerializer, serialization_options_for(initiatives))
  end

  def index_initiative_markers
    initiatives = InitiativesFinder.new(
      params,
      current_user: current_user,
      scope: policy_scope(Initiative)
    ).find_records
    render json: linked_json(initiatives, WebApi::V1::PostMarkerSerializer, params: jsonapi_serializer_params)
  end

  def index_xlsx
    authorize :initiative, :index_xlsx?
    initiatives = InitiativesFinder.new(
      params,
      current_user: current_user,
      scope: policy_scope(Initiative).where(publication_status: 'published'),
      includes: %i[author initiative_status topics areas],
      paginate: false
    ).find_records

    I18n.with_locale(current_user&.locale) do
      xlsx = XlsxService.new.generate_initiatives_xlsx initiatives,
        view_private_attributes: Pundit.policy!(current_user,
          User).view_private_attributes?
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'initiatives.xlsx'
    end
  end

  def filter_counts
    initiatives = policy_scope(Initiative)
    search_last_names = !UserDisplayNameService.new(AppConfiguration.instance, current_user).restricted?
    initiatives = PostsFilteringService.new.apply_common_initiative_index_filters(
      initiatives, params,
      search_last_names
    )
    counts = {
      'initiative_status_id' => {},
      'area_id' => {},
      'topic_id' => {}
    }
    attributes = %w[initiative_status_id area_id topic_id]
    initiatives
      .joins('FULL OUTER JOIN initiatives_topics ON initiatives_topics.initiative_id = initiatives.id')
      .joins('FULL OUTER JOIN areas_initiatives ON areas_initiatives.initiative_id = initiatives.id')
      .joins('FULL OUTER JOIN initiative_initiative_statuses ON initiative_initiative_statuses.initiative_id = initiatives.id')
      .select('initiative_initiative_statuses.initiative_status_id, areas_initiatives.area_id, initiatives_topics.topic_id, COUNT(DISTINCT(initiatives.id)) as count')
      .reorder(nil) # Avoids SQL error on GROUP BY when a search string was used
      .group('GROUPING SETS (initiative_initiative_statuses.initiative_status_id, areas_initiatives.area_id, initiatives_topics.topic_id)')
      .each do |record|
        attributes.each do |attribute|
          id = record.send attribute
          counts[attribute][id] = record.count if id
        end
      end
    counts['total'] = initiatives.count
    render json: raw_json(counts)
  end

  def show
    render json: WebApi::V1::InitiativeSerializer.new(
      @initiative,
      params: jsonapi_serializer_params,
      include: %i[author topics areas user_vote initiative_images]
    ).serializable_hash
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
    verify_profanity @initiative

    save_options = {}
    save_options[:context] = :publication if params.dig(:initiative, :publication_status) == 'published'
    ActiveRecord::Base.transaction do
      if @initiative.save save_options
        service.after_create(@initiative, current_user)
        render json: WebApi::V1::InitiativeSerializer.new(
          @initiative.reload,
          params: jsonapi_serializer_params,
          include: %i[author topics areas user_vote initiative_images]
        ).serializable_hash, status: :created
      else
        render json: { errors: @initiative.errors.details }, status: :unprocessable_entity
      end
    end
  end

  def update
    service = SideFxInitiativeService.new

    initiative_params = permitted_attributes(@initiative)
    @initiative.assign_attributes(initiative_params)
    remove_image_if_requested!(@initiative, initiative_params, :header_bg)

    authorize @initiative
    verify_profanity @initiative

    service.before_update(@initiative, current_user)

    save_options = {}
    save_options[:context] = :publication if params.dig(:initiative, :publication_status) == 'published'
    saved = nil
    ActiveRecord::Base.transaction do
      saved = @initiative.save save_options
      if saved
        authorize @initiative unless @initiative.anonymous? # Cannot auth the user if updated to anonymous
        service.after_update(@initiative, current_user)
      end
    end

    # Keeping `render` outside of the transaction is better anyway.
    # Additionally, if we wouldn't do it here, we're running into an issue
    # where carrierwave is not storing the actual header_bg file on the
    # filesystem. The root cause it not exactly clear.
    if saved
      render json: WebApi::V1::InitiativeSerializer.new(
        @initiative.reload,
        params: jsonapi_serializer_params,
        include: %i[author topics areas user_vote initiative_images]
      ).serializable_hash, status: :ok
    else
      render json: { errors: @initiative.errors.details }, status: :unprocessable_entity
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
      head :internal_server_error
    end
  end

  def allowed_transitions
    authorize @initiative
    render json: raw_json(InitiativeStatusService.new.allowed_transitions(@initiative))
  end

  private

  def set_initiative
    @initiative = Initiative.find params[:id]
    authorize @initiative
  end

  def serialization_options_for(initiatives)
    default_params = jsonapi_serializer_params(pcs: ParticipationContextService.new)

    if current_user
      votes = current_user.votes.where(
        votable_id: initiatives.pluck(:id),
        votable_type: 'Initiative'
      ).index_by(&:votable_id)
      { params: default_params.merge(vbii: votes), include: %i[author user_vote initiative_images assignee] }
    else
      { params: default_params, include: %i[author initiative_images] }
    end
  end

  def display_names_restricted?
    UserDisplayNameService.new(Tenant.current, current_user).restricted?
  end
end
