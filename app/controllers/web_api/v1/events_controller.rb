class WebApi::V1::EventsController < ApplicationController
  before_action :set_event, only: [:show, :update, :destroy]

  def index
    @events = policy_scope(Event)
      .where(project_id: params[:project_id])
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
      .order(:start_at)
    render json: @events
  end

  def show
    render json: @event
  end

  def create
    @event = Event.new(event_params)
    @event.project_id = params[:project_id]
    authorize @event

    if @event.save
      render json: @event, status: :created
    else
      render json: { errors: @event.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    if @event.update(event_params)
      render json: @event, status: :ok
    else
      render json: { errors: @event.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    @event.destroy
    head :ok
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
