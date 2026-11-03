# frozen_string_literal: true

module ContentBuilder
  class SideFxLayoutService
    include SideFxHelper

    def before_create(layout, _user)
      swap_data_images layout
    end

    def after_create(layout, user)
      LogActivityJob.perform_later(layout, 'created', user, layout.created_at.to_i)
      mark_project_page_saved(layout)
    end

    def before_update(layout, _user)
      swap_data_images layout
    end

    def after_update(layout, user)
      LogActivityJob.perform_later(layout, 'changed', user, layout.updated_at.to_i)
      mark_project_page_saved(layout)
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

    # Any save counts, even with an unchanged layout. `update`, not `update!`, so an invalid old project can't fail the save.
    def mark_project_page_saved(layout)
      return unless layout.code == ProjectPageLayoutService::CODE

      project = layout.content_buildable
      return if !project.is_a?(Project) || project.completed_setup_steps.include?('page')

      project.update(completed_setup_steps: [*project.completed_setup_steps, 'page'])
    end

    # Extracts inline image data into image records before the layout is saved:
    # structured ImageMultiloc nodes via LayoutImage, and legacy HTML inside
    # RichTextMultiloc bridge nodes via TextImage. The TextImage records hang off
    # the content buildable, not the layout, so they survive a layout rewrite.
    def swap_data_images(layout)
      layout.craftjs_json = LayoutImageService.new.swap_data_images layout.craftjs_json
      layout.craftjs_json = LayoutTextImageService.new.swap_data_images(
        layout.craftjs_json, imageable: layout.content_buildable
      )
    end
  end
end
