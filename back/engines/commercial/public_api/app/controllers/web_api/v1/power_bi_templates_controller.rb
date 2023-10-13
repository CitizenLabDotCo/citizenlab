# frozen_string_literal: true

module PublicApi
  class WebApi::V1::PowerBiTemplatesController < ApplicationController
    # Download a template - files behind a controller to give permission only to admins
    def show
      authorize :'public_api/power_bi_template'

      if params[:id] == 'dataflow'
        template = Rails.root.join('engines/commercial/public_api/files/power_bi/dataflow.json')
        # Search and replace API base URL
        file_text = open(template).read
        host = AppConfiguration.instance.base_backend_uri
        replaced = file_text.gsub(/##BASE_URL##/, "#{host}/api/v2/")
        send_data replaced, type: 'application/octet-stream'
      elsif params[:id] == 'report'
        template = Rails.root.join('engines/commercial/public_api/files/power_bi/report.pbit')
        send_data open(template).read, type: 'application/octet-stream'
      else
        render json: { error: 'Not found' }, status: :not_found
      end
    end
  end
end
