# frozen_string_literal: true

class WebApi::V1::IdeaStatusesController < ApplicationController
  serializer_class WebApi::V1::IdeaStatusSerializer
  skip_before_action :authenticate_user, only: %i[index show]

  def index
    idea_statuses = policy_scope(IdeaStatus)
    idea_statuses = filter_params idea_statuses, :participation_method
    render_success idea_statuses
  end

  def show
    render_success idea_status
  end

  def create
    idea_status = IdeaStatus.new(idea_status_params)
    authorize idea_status
    if idea_status.save
      SideFxIdeaStatusService.new.after_create(idea_status, current_user)
      render_success idea_status
    else
      render_error idea_status
    end
  end

  def update
    if idea_status.update(idea_status_params)
      SideFxIdeaStatusService.new.after_update(idea_status, current_user)
      render_success idea_status
    else
      render_error idea_status
    end
  end

  def reorder
    if idea_status.insert_at(permitted_attributes(idea_status)[:ordering])
      SideFxIdeaStatusService.new.after_update(idea_status, current_user)
      render_success idea_status
    else
      render_error idea_status
    end
  end

  def destroy
    if idea_status.proposed?
      render_error('Cannot delete the proposed status')
      return
    end
    frozen_idea_status = idea_status.destroy
    if frozen_idea_status.destroyed?
      SideFxIdeaStatusService.new.after_destroy(frozen_idea_status, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def idea_status
    @idea_status ||= IdeaStatus.find(params[:id]).tap do |idea_status|
      authorize idea_status
    end
  end

  def idea_status_params
    params.require(:idea_status).permit(
      :code, :color, :participation_method,
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES
    )
  end
end
