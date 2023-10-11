# frozen_string_literal: true

class WebApi::V1::InitiativesController < ApplicationController
  include BlockingProfanity

  before_action :set_initiative, only: %i[show update destroy allowed_transitions accept_cosponsorship_invite]
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
    initiatives = paginate SortByParamsService.new.sort_initiatives(initiatives, params, current_user)
    render json: linked_json(initiatives, WebApi::V1::InitiativeSerializer, serialization_options_for(initiatives))
  end

  def index_initiative_markers
    initiatives = InitiativesFinder.new(
      params,
      current_user: current_user,
      scope: policy_scope(Initiative)
    ).find_records
    initiatives = paginate SortByParamsService.new.sort_initiatives(initiatives, params, current_user)
    render json: linked_json(initiatives, WebApi::V1::PostMarkerSerializer, params: jsonapi_serializer_params)
  end

  def index_xlsx
    authorize :initiative, :index_xlsx?
    initiatives = InitiativesFinder.new(
      params,
      current_user: current_user,
      scope: policy_scope(Initiative).where(publication_status: 'published'),
      includes: %i[author cosponsors initiative_status topics areas]
    ).find_records
    initiatives = SortByParamsService.new.sort_initiatives(initiatives, params, current_user)

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
      .reorder(nil) # Avoids SQL error on GROUP BY when a search string is used
      .group('GROUPING SETS (initiative_initiative_statuses.initiative_status_id, areas_initiatives.area_id, initiatives_topics.topic_id)')
      .each do |record|
        attributes.each do |attribute|
          id = record.send attribute
          counts[attribute][id] = record.count if id
        end
      end
    counts['total'] = initiatives.reorder(nil).distinct.count # reorder(nil) avoids SQL error on SELECT DISTINCT when a search string is used
    render json: raw_json(counts)
  end

  def show
    render json: WebApi::V1::InitiativeSerializer.new(
      @initiative,
      params: jsonapi_serializer_params,
      include: %i[author cosponsors topics areas user_reaction initiative_images]
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
    if anonymous_not_allowed?
      render json: { errors: { base: [{ error: :anonymous_participation_not_allowed }] } }, status: :unprocessable_entity
      return
    end
    verify_profanity @initiative

    save_options = {}
    save_options[:context] = :publication if params.dig(:initiative, :publication_status) == 'published'
    ActiveRecord::Base.transaction do
      if @initiative.save save_options
        service.after_create(@initiative, current_user)
        render json: WebApi::V1::InitiativeSerializer.new(
          @initiative.reload,
          params: jsonapi_serializer_params,
          include: %i[author cosponsors topics areas user_reaction initiative_images]
        ).serializable_hash, status: :created
      else
        render json: { errors: @initiative.errors.details }, status: :unprocessable_entity
      end
    end
  end

  def update
    service = SideFxInitiativeService.new

    cosponsor_ids = @initiative.cosponsors.map(&:id)
    initiative_params = permitted_attributes(@initiative)
    @initiative.assign_attributes(initiative_params)
    remove_image_if_requested!(@initiative, initiative_params, :header_bg)

    authorize @initiative
    if anonymous_not_allowed?
      render json: { errors: { base: [{ error: :anonymous_participation_not_allowed }] } }, status: :unprocessable_entity
      return
    end
    verify_profanity @initiative

    service.before_update(@initiative, current_user)

    save_options = {}
    save_options[:context] = :publication if params.dig(:initiative, :publication_status) == 'published'
    saved = nil
    ActiveRecord::Base.transaction do
      saved = @initiative.save save_options
      if saved
        service.after_update(@initiative, current_user, cosponsor_ids)
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
        include: %i[author cosponsors topics areas user_reaction initiative_images]
      ).serializable_hash, status: :ok
    else
      render json: { errors: @initiative.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    service = SideFxInitiativeService.new

    initiative = @initiative.destroy
    if initiative.destroyed?
      service.after_destroy(initiative, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  def accept_cosponsorship_invite
    @cosponsors_initiative = @initiative.cosponsors_initiatives.find_by(user_id: current_user.id)

    if @cosponsors_initiative.update(status: 'accepted')
      SideFxInitiativeService.new.after_accept_cosponsorship_invite(@cosponsors_initiative, current_user)

      render json: WebApi::V1::InitiativeSerializer.new(
        @initiative.reload,
        params: jsonapi_serializer_params,
        include: %i[author cosponsors topics areas user_reaction initiative_images]
      ).serializable_hash, status: :ok
    else
      render json: { errors: @initiative.errors.details }, status: :unprocessable_entity
    end
  end

  def allowed_transitions
    authorize @initiative
    render json: raw_json(InitiativeStatusService.new.allowed_transitions(@initiative))
  end

  private

  # renders errors in the new HookForm format
  def render_profanity_blocked(exception)
    errors = exception.violating_attributes.index_with { [{ error: :includes_banned_words }] }
    render json: { errors: errors }, status: :unprocessable_entity
  end

  def set_initiative
    @initiative = Initiative.find params[:id]
    authorize @initiative
  end

  def serialization_options_for(initiatives)
    default_params = jsonapi_serializer_params(pcs: ParticipationContextService.new)

    if current_user
      reactions = current_user.reactions.where(
        reactable_id: initiatives.pluck(:id),
        reactable_type: 'Initiative'
      ).index_by(&:reactable_id)
      user_followers = current_user.follows
        .where(followable_type: 'Initiative')
        .group_by do |follower|
          [follower.followable_id, follower.followable_type]
        end
      user_followers ||= {}
      { params: default_params.merge(vbii: reactions, user_followers: user_followers), include: %i[author cosponsors user_reaction initiative_images assignee] }
    else
      { params: default_params, include: %i[author cosponsors initiative_images] }
    end
  end

  def display_names_restricted?
    UserDisplayNameService.new(Tenant.current, current_user).restricted?
  end

  def anonymous_not_allowed?
    params.dig('initiative', 'anonymous') && !AppConfiguration.instance.settings.dig('initiatives', 'allow_anonymous_participation')
  end
end
