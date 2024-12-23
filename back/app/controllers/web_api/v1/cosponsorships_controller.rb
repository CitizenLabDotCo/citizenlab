# frozen_string_literal: true

class WebApi::V1::CosponsorshipsController < ApplicationController
  before_action :set_cosponsorship, except: %i[index]
  skip_before_action :authenticate_user, only: %i[index]

  def index
    cosponsorships = policy_scope(Cosponsorship)

    # Filter by idea id param
    if params[:idea_id]
      cosponsorships = cosponsorships.where(idea_id: params[:idea_id])
    end

    paginated_cosponsorships = paginate cosponsorships
    render json: linked_json(paginated_cosponsorships, WebApi::V1::CosponsorshipSerializer, params: jsonapi_serializer_params)
  end

  def accept
    if @cosponsorship.save && @cosponsorship.status == 'pending'
      @cosponsorship.update(status: 'accepted')
      SideFxCosponsorshipService.new.after_accept(@cosponsorship, current_user)
      render json: WebApi::V1::CosponsorshipSerializer.new(@cosponsorship, params: jsonapi_serializer_params).serializable_hash
    else
      render json: { errors: @cosponsorship.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def set_cosponsorship
    @cosponsorship = Cosponsorship.find(params[:id])
    authorize @cosponsorship
  end
end
