# frozen_string_literal: true

module ReportBuilder
  module WebApi
    module V1
      class DataUnitsController < ApplicationController
        def users_by_gender
          results = ReportBuilder::QueryRepository.new.users_by_gender
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
