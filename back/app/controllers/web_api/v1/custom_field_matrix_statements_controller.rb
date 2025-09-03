# frozen_string_literal: true

class WebApi::V1::CustomFieldMatrixStatementsController < ApplicationController
  before_action :set_statement, only: %i[show]
  before_action :set_custom_field, only: %i[index]
  skip_before_action :authenticate_user

  def index
    @statements = policy_scope(CustomFieldMatrixStatement).where(custom_field: @custom_field).order(:ordering)
    render json: WebApi::V1::CustomFieldMatrixStatementSerializer.new(@statements, params: jsonapi_serializer_params).serializable_hash
  end

  def show
    render json: WebApi::V1::CustomFieldMatrixStatementSerializer.new(@statement, params: jsonapi_serializer_params).serializable_hash
  end

  private

  def set_custom_field
    @custom_field = CustomField.find(params[:custom_field_id])
  end

  def set_statement
    @statement = CustomFieldMatrixStatement.find(params[:id])
    authorize @statement
  end
end
