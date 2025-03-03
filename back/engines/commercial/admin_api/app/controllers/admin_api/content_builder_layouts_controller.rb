# frozen_string_literal: true

module AdminApi
  class ContentBuilderLayoutsController < AdminApiController
    # Experimental: endpoint to get the textual multiloc values of a project description layout
    def project_description_layout_multiloc
      layout = ContentBuilder::Layout.find_by(
        content_buildable_id: params[:id],
        code: 'project_description',
        enabled: true
      )

      multiloc = ContentBuilder::Craftjs::VisibleTextualMultilocs.new(layout.craftjs_json).extract_and_join if layout

      render json: multiloc || {}
    end
  end
end
