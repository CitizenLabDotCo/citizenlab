# frozen_string_literal: true

class WebApi::V1::CosponsorshipsController < ApplicationController
  before_action :set_cosponsorship, except: %i[index]
  skip_before_action :authenticate_user, only: %i[index]

  def index
    cosponsorships = policy_scope(Cosponsorship)
    paginated_cosponsorships = paginate cosponsorships
    render json: linked_json(paginated_cosponsorships, WebApi::V1::CosponsorshipSerializer, params: jsonapi_serializer_params)
  end

  def accept_cosponsorship; end

  private

  def set_topic
    @cosponsorship = Cosponsorship.find(params[:id])
    authorize @cosponsorship
  end
end
