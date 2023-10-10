# frozen_string_literal: true

module PublicApi
  class WebApi::V1::PowerBiTemplatesController < ApplicationController

    # Download a template - protected so only available to admins
    def show
      dataflow_template = Rails.root.join('engines/commercial/public_api/config/power_bi/dataflow.json')
      reporting_template = Rails.root.join('engines/commercial/public_api/config/power_bi/report.pbit')

      authorize :'public_api/power_bi_template'

      send_data open(dataflow_template).read, type: 'application/octet-stream'
    end
  end
end
