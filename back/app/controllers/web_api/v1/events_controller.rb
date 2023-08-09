# frozen_string_literal: true

class WebApi::V1::EventsController < ApplicationController
  before_action :set_event, only: %i[show update destroy]
  skip_before_action :authenticate_user

  def index
    events = EventsFinder.new(params, scope: policy_scope(Event), current_user: current_user).find_records
    events = paginate SortByParamsService.new.sort_events(events, params)

    serializer_params = jsonapi_serializer_params
      .merge(current_user_attendances: current_user_attendances(events))

    render json: linked_json(
      events,
      WebApi::V1::EventSerializer,
      params: serializer_params
    )
  end

  def index_by_attendee
    # Here, we used `Pundit` in an unconventional manner by passing the `attendee_id`
    # parameter instead of an Event instance. The first thing to note is that this is an
    # index action. So, it is not about a single Event instance, but rather a collection
    # of them. But, most importantly, what we are checking here is not whether the
    # current user is permitted to view the events (since most events are public and
    # visible to anyone). Instead, we are verifying whether the current user is allowed
    # to view the list of events to which the attendee passed in parameter is registered.
    # (As a second step, the events are scoped down by the policy — as usual for
    # collections — in `#index` to which this action delegates.)
    authorize(params[:attendee_id], policy_class: EventPolicy)
    index
  end

  def show
    render json: WebApi::V1::EventSerializer.new(@event, params: jsonapi_serializer_params).serializable_hash
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
      :location_description,
      location_point_geojson: [:type, { coordinates: [] }],
      location_multiloc: CL2_SUPPORTED_LOCALES,
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES
    ).tap do |p|
      # Allow removing the location point.
      if params[:event].key?(:location_point_geojson) && params.dig(:event, :location_point_geojson).nil?
        p[:location_point_geojson] = nil
      end

      # Set default location_description if not provided and location_multiloc is
      # provided. This will be removed once the location_multiloc parameter is removed.
      if p[:location_multiloc].present?
        p[:location_description] ||= p.dig(:location_multiloc, default_locale)
        p[:location_description] ||= p[:location_multiloc].values.first
      end
    end
  end

  def default_locale
    AppConfiguration.instance.settings('core', 'locales').first
  end
end
