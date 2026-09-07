# frozen_string_literal: true

# Authors a description on the Content Builder the way the builder would: a text
# widget in a project's page body, or the text of a folder's description layout.
# Factories bypass the SideFx hook that provisions layouts, and a provisioned
# project page holds only placeholder text.
module DescriptionLayoutHelpers
  def author_description(buildable, text_multiloc, widget: 'TextMultiloc')
    if buildable.is_a?(Project)
      code = ContentBuilder::ProjectPageLayoutService::CODE
      body = {
        'ROOT' => craftjs_root(['DESCRIPTION']),
        # HtmlBlockMultiloc keeps its body in `html`; every other text widget in `text`.
        'DESCRIPTION' => craftjs_node(widget, parent: 'ROOT', props: { body_prop(widget) => text_multiloc })
      }
      craftjs_json = ContentBuilder::ProjectPageLayoutService.new.craftjs_json_from_body(body)
    else
      code = ContentBuilder::LayoutProvisioningService::FOLDER_LAYOUT_CODE
      craftjs_json = ContentBuilder::LayoutProvisioningService.new.default_folder_craftjs_json(buildable, text_multiloc)
    end

    ContentBuilder::Layout.create!(content_buildable: buildable, code: code, enabled: true, craftjs_json: craftjs_json)
  end

  private

  def body_prop(widget)
    widget == 'HtmlBlockMultiloc' ? 'html' : 'text'
  end
end

RSpec.configure do |config|
  config.include DescriptionLayoutHelpers
end
