class WebApi::V1::AuthoringAssistanceResponseController < ApplicationController
  def create
    if AuthoringAssistanceResponse.find_by(idea_id: params[:idea_id]) && !parse_bool(params[:regenerate])
      render_last_authoring_assistance_response
    else
      create_authoring_assistance_response
    end
  end

  private

  def render_last_authoring_assistance_response
    @response = AuthoringAssistanceResponse.order(created_at: :desc).find_by!(idea_id: params[:idea_id])
    render json: WebApi::V1::AuthoringAssistanceResponseSerializer.new(
      @response,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  def create_authoring_assistance_response
    @response = AuthoringAssistanceResponse.new authoring_assistance_response_params
    @response.idea_id = params[:idea_id]
    authorize @response
    if !@response.save
      render json: { errors: @response.errors.details }, status: :unprocessable_entity
      return
    end

    # TODO: Run prompts

    SideFxAuthoringAssistanceResponse.new.after_create @response, current_user
    render json: WebApi::V1::AuthoringAssistanceResponseSerializer.new(
      @response,
      params: jsonapi_serializer_params
    ).serializable_hash, status: :created
  end

  def authoring_assistance_response_params
    params.require(:authoring_assistance_response).permit(:custom_free_prompt)
  end
end
