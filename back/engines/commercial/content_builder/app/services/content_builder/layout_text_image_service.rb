# frozen_string_literal: true

module ContentBuilder
  # Resolves inline legacy `<img>` references inside the migration-only
  # "bridge" widget (RichTextMultiloc), whose `props.text` holds raw legacy
  # WYSIWYG (Quill) HTML. Those images use the TextImage pipeline
  # (`data-cl2-text-image-text-reference`), which the standard layout serializer
  # never runs — it only resolves structured ImageMultiloc nodes via
  # {LayoutImageService}. Without this pass migrated inline images render with no
  # `src`.
  #
  # Mirrors the shape of {LayoutImageService}: given a craftjs_json, it returns
  # the same structure with the bridge nodes' HTML rendered.
  class LayoutTextImageService
    # craftjs node types whose `props.text` holds raw legacy HTML with inline
    # TextImage references.
    RICH_TEXT_NODE_TYPES = %w[RichTextMultiloc].freeze

    # @param craftjs_json [Hash] the layout's craftjs_json.
    # @param imageable [ActiveRecord::Base, nil] the record the inline images
    #   belong to (the project/folder). Only used to speed up lookups; resolution
    #   falls back to a global lookup by reference, so `nil` is safe.
    def render_data_images(craftjs_json, imageable: nil)
      return craftjs_json if craftjs_json.blank?

      text_image_service = TextImageService.new
      LayoutService.new.select_craftjs_elements_for_types(craftjs_json, RICH_TEXT_NODE_TYPES).each do |element|
        text_multiloc = element.dig('props', 'text')
        next unless text_multiloc.is_a?(Hash)

        element['props']['text'] = text_image_service.render_data_images_multiloc(
          text_multiloc, imageable: imageable, field: 'craftjs_json'
        )
      end
      craftjs_json
    end
  end
end
