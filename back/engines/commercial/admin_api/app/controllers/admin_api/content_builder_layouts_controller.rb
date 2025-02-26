# frozen_string_literal: true

module AdminApi
  class ContentBuilderLayoutsController < AdminApiController
    # Experimental: endpoint to get the textual multiloc values of a project description layout
    def description_layout_multilocs
      layout = ContentBuilder::Layout.find_by(
        content_buildable_id: params[:id],
        code: 'project_description',
        enabled: true
      )

      multilocs = ContentBuilder::Craftjs::TextMultilocsInVisualOrder.new(layout.craftjs_json).extract if layout

      render json: { multilocs: multilocs }
    end
  end
end
