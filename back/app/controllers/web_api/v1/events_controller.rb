# frozen_string_literal: true

class WebApi::V1::EventsController < ApplicationController
  before_action :set_event, only: %i[show update destroy]
  skip_before_action :authenticate_user

  def index
    scope = EventPolicy::Scope.new(current_user, Event, params[:attendee_id]).resolve
    # Necessary because we instantiate the scope directly instead of using Pundit's
    # `policy_scope` method.
    skip_policy_scope

    events = EventsFinder
      .new(params, scope: scope, current_user: current_user)
      .find_records

    events = paginate SortByParamsService.new.sort_events(events, params)

    serializer_params = jsonapi_serializer_params
      .merge(current_user_attendances: current_user_attendances(events))

    render json: linked_json(
      events,
      WebApi::V1::EventSerializer,
      params: serializer_params
    )
  end

  def show
    render json: WebApi::V1::EventSerializer
      .new(@event, params: jsonapi_serializer_params)
      .serializable_hash
  end

  def create
    event = Event.new(event_params)
    event.project_id = params[:project_id]

    SideFxEventService.new.before_create(event, current_user)

    authorize(event)

    if event.save
      SideFxEventService.new.after_create(event, current_user)
      render json: WebApi::V1::EventSerializer.new(event, params: jsonapi_serializer_params).serializable_hash, status: :created
    else
      render json: { errors: event.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @event.assign_attributes event_params
    authorize @event
    SideFxEventService.new.before_update(@event, current_user)
    if @event.save
      SideFxEventService.new.after_update(@event, current_user)
      render json: WebApi::V1::EventSerializer.new(@event, params: jsonapi_serializer_params).serializable_hash, status: :ok
    else
      render json: { errors: @event.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    event = @event.destroy
    if event.destroyed?
      SideFxEventService.new.after_destroy(@event, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  # Given a collection of events, returns a mapping of event ids to attendances of the
  # current user. The returned mapping includes only the events for which the current
  # user is registered.
  #
  # @param [Enumerable<Event>] events A collection of events
  # @return [Hash{String => Events::Attendance}] A mapping of event ids to attendances
  #   of the current user.
  def current_user_attendances(events)
    return {} unless current_user

    Events::Attendance
      .where(event: events, attendee: current_user)
      .index_by(&:event_id)
  end

  def set_event
    @event = Event.find(params[:id])
    authorize @event
  end

  def event_params
    params.require(:event).permit(
      :project_id,
      :start_at,
      :end_at,
      :online_link,
      location_point_geojson: [:type, { coordinates: [] }],
      :address_1,
      address_2_multiloc: CL2_SUPPORTED_LOCALES,
      location_multiloc: CL2_SUPPORTED_LOCALES,
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES,
      location_point_geojson: [:type, { coordinates: [] }]
    ).tap do |p|
      # Allow removing the location point.
      if params[:event].key?(:location_point_geojson) && params.dig(:event, :location_point_geojson).nil?
        p[:location_point_geojson] = nil
      end

      # Set default `address_1` if not provided and location_multiloc is provided. This
      # will be removed once the location_multiloc parameter is removed.
      if p[:location_multiloc].present?
        p[:address_1] ||= p.dig(:location_multiloc, default_locale)
        p[:address_1] ||= p[:location_multiloc].values.first
      end
    end
  end

  def default_locale
    AppConfiguration.instance.settings('core', 'locales').first
  end
end
