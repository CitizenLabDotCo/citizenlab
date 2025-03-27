# frozen_string_literal: true

class WebApi::V1::CustomFieldBinsController < ApplicationController
  before_action :set_custom_field, only: [:index]
  before_action :set_custom_field_bin, only: [:show]
  skip_after_action :verify_policy_scoped

  def index
    bins = @custom_field.custom_field_bins
    bins = bins.order(:created_at)
    bins = paginate(bins)
    render json: linked_json(bins, WebApi::V1::CustomFieldBinSerializer, params: jsonapi_serializer_params)
  end

  def show
    render json: WebApi::V1::CustomFieldBinSerializer
      .new(
        @bin,
        params: jsonapi_serializer_params
      ).serializable_hash
  end

  private

  def set_custom_field_bin
    @bin = CustomFieldBin.find(params[:id])
    authorize @bin, :show?
  end

  def set_custom_field
    @custom_field = CustomField.find(params[:custom_field_id])
    authorize @custom_field, :show?
  end
end
