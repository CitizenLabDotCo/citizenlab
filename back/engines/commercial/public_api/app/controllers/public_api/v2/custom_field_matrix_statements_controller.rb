# frozen_string_literal: true

module PublicApi
  class V2::CustomFieldMatrixStatementsController < PublicApiController
    include DeletedItemsAction

    def index
      list_items CustomFieldMatrixStatement.where(query_filters), V2::CustomFieldMatrixStatementSerializer
    end

    def show
      show_item CustomFieldMatrixStatement.find(params[:id]), V2::CustomFieldMatrixStatementSerializer
    end

    private

    def query_filters
      params.permit(:custom_field_id).to_h
    end
  end
end
