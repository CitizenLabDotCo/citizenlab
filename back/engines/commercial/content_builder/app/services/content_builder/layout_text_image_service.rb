# frozen_string_literal: true

module ContentBuilder
  # Resolves inline legacy `<img>` references inside the migration-only bridge
  # widget (RichTextMultiloc), whose `props.text` holds raw legacy WYSIWYG (Quill)
  # HTML. Those images use the TextImage pipeline
  # (`data-cl2-text-image-text-reference`), which {LayoutImageService} does not
  # handle — it only resolves structured ImageMultiloc nodes. Without this pass
  # migrated inline images render with no `src`.
  class LayoutTextImageService
    RICH_TEXT_NODE_TYPES = %w[RichTextMultiloc].freeze

    # @param imageable [ActiveRecord::Base, nil] the record the inline images belong
    #   to. Only speeds up lookups; resolution falls back to a global lookup, so nil is safe.
    def render_data_images(craftjs_json, imageable: nil)
      return craftjs_json if craftjs_json.blank?

      text_image_service = TextImageService.new
      bridge_text_multilocs(craftjs_json) do |element, text_multiloc|
        element['props']['text'] = text_image_service.render_data_images_multiloc(
          text_multiloc, imageable: imageable, field: 'craftjs_json'
        )
      end
      craftjs_json
    end

    # The save-side counterpart of {#render_data_images}: extracts newly added inline
    # images from bridge nodes into {TextImage} records, replacing them with a
    # `data-cl2-text-image-text-reference` attribute and stripping the render-time `src`
    # so the stored craftjs_json stays reference-only.
    #
    # @param imageable [ActiveRecord::Base, nil] the record the extracted images belong
    #   to. Required to extract new images; layouts without one have no bridge nodes.
    def swap_data_images(craftjs_json, imageable: nil)
      return craftjs_json if craftjs_json.blank?

      text_image_service = TextImageService.new
      bridge_text_multilocs(craftjs_json) do |element, text_multiloc|
        element['props']['text'] = text_image_service.swap_data_images(
          text_multiloc, imageable: imageable, field: 'craftjs_json'
        )
      end
      craftjs_json
    end

    private

    def bridge_text_multilocs(craftjs_json)
      LayoutService.new.select_craftjs_elements_for_types(craftjs_json, RICH_TEXT_NODE_TYPES).each do |element|
        text_multiloc = element.dig('props', 'text')
        next unless text_multiloc.is_a?(Hash)

        yield element, text_multiloc
      end
    end
  end
end
