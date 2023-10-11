# frozen_string_literal: true

module PublicApi
  class WebApi::V1::PowerBiTemplatesController < ApplicationController
    # Download a template - only available to admins
    def show
      authorize :'public_api/power_bi_template'

      if params[:id] == 'dataflow'
        template = Rails.root.join('engines/commercial/public_api/config/power_bi/dataflow.json')
        # Search and replace host name
        file_text = open(template).read
        replaced = file_text.gsub(/##BASE_URL##/, 'https://TEST.citizenlab.co/api/v2/')

        # TODO: We need the actual host in here

        send_data replaced, type: 'application/octet-stream'
      elsif params[:id] == 'report'
        template = Rails.root.join('engines/commercial/public_api/config/power_bi/report.pbit')
        send_data open(template).read, type: 'application/octet-stream'
      else
        render json: { error: 'Not found' }, status: :not_found
      end
    end
  end
end
