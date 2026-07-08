# frozen_string_literal: true

module ContentBuilder
  class SideFxLayoutService
    include SideFxHelper

    def before_create(layout, _user)
      swap_data_images layout
    end

    def after_create(layout, user)
      LogActivityJob.perform_later(layout, 'created', user, layout.created_at.to_i)
    end

    def before_update(layout, _user)
      swap_data_images layout
    end

    def after_update(layout, user)
      LogActivityJob.perform_later(layout, 'changed', user, layout.updated_at.to_i)
    end

    def before_destroy(layout, user); end

    def after_destroy(frozen_layout, user)
      serialized_layout = clean_time_attributes(frozen_layout.attributes)
      LogActivityJob.perform_later(
        encode_frozen_resource(frozen_layout),
        'deleted',
        user,
        Time.now.to_i,
        payload: { layout: serialized_layout }
      )
    end

    private

    # Extracts inline image data into image records before the layout is saved:
    # structured ImageMultiloc nodes via LayoutImage, and legacy HTML inside
    # RichTextMultiloc bridge nodes via TextImage (owned by the content
    # buildable, like the legacy description images they sit alongside).
    def swap_data_images(layout)
      layout.craftjs_json = LayoutImageService.new.swap_data_images layout.craftjs_json
      layout.craftjs_json = LayoutTextImageService.new.swap_data_images(
        layout.craftjs_json, imageable: layout.content_buildable
      )
    end
  end
end
