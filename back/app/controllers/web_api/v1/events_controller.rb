# frozen_string_literal: true

class WebApi::V1::EventsController < ApplicationController
  include ActionController::MimeResponds

  before_action :set_event, only: %i[show update destroy]
  skip_before_action :authenticate_user

  def index
    scope = EventPolicy::Scope.new(pundit_user, Event, params[:attendee_id]).resolve
    # Necessary because we instantiate the scope directly instead of using Pundit's
    # `policy_scope` method.
    skip_policy_scope

    events = EventsFinder
      .new(
        finder_params,
        scope: scope,
        current_user: current_user,
        includes: [
          :event_images
        ]
      ).find_records

    events = paginate SortByParamsService.new.sort_events(events, params)

    serializer_params = jsonapi_serializer_params
      .merge(current_user_attendances: current_user_attendances(events))

    render json: linked_json(
      events,
      WebApi::V1::EventSerializer,
      params: serializer_params
    )
  end

  # GET events/:event_id/attendees_xlsx
  def attendees_xlsx
    event = Event.find(params[:id])
    authorize(event)

    attendees = User.where(id: event.attendances.pluck(:attendee_id))

    I18n.with_locale(current_user&.locale) do
      xlsx = Export::Xlsx::AttendeesGenerator.new.generate_attendees_xlsx attendees, view_private_attributes: true
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'attendees.xlsx'
    end

    sidefx.after_attendees_xlsx(event, current_user)
  end

  def show
    respond_to do |format|
      format.json do
        render json: WebApi::V1::EventSerializer
          .new(
            @event,
            params: jsonapi_serializer_params,
            include: %i[event_images]
          ).serializable_hash
      end

      format.ics do
        preferred_locale = current_user&.locale
        render plain: Events::IcsGenerator.new.generate_ics(@event, preferred_locale)
      end
    end
  end

  def create
    event = Event.new(event_params)
    event.project_id = params[:project_id]

    sidefx.before_create(event, current_user)

    authorize(event)

    if event.save
      sidefx.after_create(event, current_user)
      render json: WebApi::V1::EventSerializer.new(event, params: jsonapi_serializer_params, include: %i[event_images]).serializable_hash, status: :created
    else
      render json: { errors: event.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @event.assign_attributes event_params
    authorize @event
    sidefx.before_update(@event, current_user)
    if @event.save
      sidefx.after_update(@event, current_user)
      render json: WebApi::V1::EventSerializer.new(@event, params: jsonapi_serializer_params, include: %i[event_images]).serializable_hash, status: :ok
    else
      render json: { errors: @event.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    event = @event.destroy
    if event.destroyed?
      sidefx.after_destroy(@event, current_user)
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
      :address_1,
      :using_url,
      :maximum_attendees,
      address_2_multiloc: CL2_SUPPORTED_LOCALES,
      location_multiloc: CL2_SUPPORTED_LOCALES,
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES,
      attend_button_multiloc: CL2_SUPPORTED_LOCALES,
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

  def finder_params
    params.tap do |p|
      if p.key?(:ongoing_during)
        p[:ongoing_during] = parse_date_range(p[:ongoing_during])
      end
    end
  end

  def parse_date_range(date_range)
    raise ArgumentError, 'date_range must be a String' unless date_range.is_a?(String)

    date_range = date_range.reverse.chomp('[').reverse.chomp(']')
    # Ignore extra items if there are more than two. ("Be conservative in what you send,
    # and liberal in what you accept.", Postel's law — at least for now)
    start_str, end_str = date_range.split(',')

    start_date = parse_date(start_str)
    end_date = parse_date(end_str)
    [start_date, end_date]
  end

  def parse_date(date_str)
    return nil unless date_str

    date_str = date_str.strip
    return nil if date_str.in?(['null', ''])

    AppConfiguration.timezone.parse(date_str)
  end

  def default_locale
    AppConfiguration.instance.settings('core', 'locales').first
  end

  def sidefx
    @sidefx ||= SideFxEventService.new
  end
end

WebApi::V1::EventsController.include(AggressiveCaching::Patches::WebApi::V1::EventsController)
