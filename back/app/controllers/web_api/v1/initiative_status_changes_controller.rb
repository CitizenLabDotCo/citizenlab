# frozen_string_literal: true

class WebApi::V1::InitiativeStatusChangesController < ApplicationController
  before_action :set_initiative, only: %i[index create]
  before_action :set_change, only: %i[show]
  skip_before_action :authenticate_user

  def index
    @changes = policy_scope(InitiativeStatusChange)
      .where(initiative: @initiative)
      .order(created_at: :desc)
    @changes = paginate @changes

    render json: linked_json(@changes, WebApi::V1::InitiativeStatusChangeSerializer, params: jsonapi_serializer_params)
  end

  def show
    render json: WebApi::V1::InitiativeStatusChangeSerializer.new(
      @change,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  def create
    attributes = status_change_params.to_h
    if attributes[:initiative_status_id] == @initiative.initiative_status_id
      skip_authorization
      render json: { errors: { base: [{ error: 'initiative_status_transition_without_change' }] } }, status: :unprocessable_entity
      return
    end
    @change = InitiativeStatusChange.new attributes
    @change.initiative = @initiative
    @change.user ||= current_user
    authorize @change
    SideFxInitiativeStatusChangeService.new.before_create @change, current_user
    if InitiativeStatusService.new.transition_allowed?(
      @initiative,
      @initiative.initiative_status,
      @change.initiative_status
    )
      if @change.save
        SideFxInitiativeStatusChangeService.new.after_create @change, current_user
        render json: WebApi::V1::InitiativeStatusChangeSerializer.new(
          @change,
          params: jsonapi_serializer_params
        ).serializable_hash, status: :created
      else
        render json: { errors: @change.errors.details }, status: :unprocessable_entity
      end
    else
      render json: { errors: { base: [{ error: 'initiative_status_transition_not_allowed' }] } }, status: :unprocessable_entity
    end
  end

  private

  def set_change
    @change = InitiativeStatusChange.find params[:id]
    authorize @change
  end

  def set_initiative
    @initiative = Initiative.find params[:initiative_id]
  end

  def status_change_params
    params.require(:initiative_status_change).permit(
      :initiative_status_id,
      :user_id
    )
  end
end
