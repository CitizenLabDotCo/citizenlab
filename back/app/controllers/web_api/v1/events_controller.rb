class WebApi::V1::EventsController < ApplicationController
  before_action :set_event, only: [:show, :update, :destroy]

  def index
    @events = policy_scope(Event).where(project_id: params[:project_id]).order(:start_at)
                                 .page(params.dig(:page, :number)).per(params.dig(:page, :size))
    render json: linked_json(@events, WebApi::V1::EventSerializer, params: fastjson_params)
  end

  def show
    render json: WebApi::V1::EventSerializer.new(@event, params: fastjson_params).serialized_json
  end

  def create
    @event = Event.new(event_params)
    @event.project_id = params[:project_id]

    SideFxEventService.new.before_create(@event, current_user)

    authorize @event

    if @event.save
      SideFxEventService.new.after_create(@event, current_user)
      render json: WebApi::V1::EventSerializer.new(@event, params: fastjson_params).serialized_json, status: :created
    else
      render json: { errors: @event.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @event.assign_attributes event_params
    authorize @event
    SideFxEventService.new.before_update(@event, current_user)
    if @event.save
      SideFxEventService.new.after_update(@event, current_user)
      render json: WebApi::V1::EventSerializer.new(@event, params: fastjson_params).serialized_json, status: :ok
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
      head 500
    end
  end

  private

  def set_event
    @event = Event.find(params[:id])
    authorize @event
  end

  def event_params
    params.require(:event).permit(
      :project_id,
      :start_at,
      :end_at,
      location_multiloc: CL2_SUPPORTED_LOCALES,
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

  def secure_controller?
    false
  end
end
