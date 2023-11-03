# frozen_string_literal: true

module ReportBuilder
  module WebApi
    module V1
      class PublishedDataUnitsController < ApplicationController
        def users_by_gender
          results = PublishedDataUnit.find_by(report.id, graph_id)
          render json: {
            data: { type: 'report_builder_data_units', attributes: results },
            links: 'paginations'
          }
        end

        def users_by_birthyear; end
      end
    end
  end
end
