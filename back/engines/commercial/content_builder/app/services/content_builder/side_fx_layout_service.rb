# frozen_string_literal: true

module ContentBuilder
  class SideFxLayoutService
    include SideFxHelper

    def before_create(layout, _user)
      # TODO: clean up after fully migrated
      layout.craftjs_jsonmultiloc = if layout.content_buildable_type == 'ReportBuilder::Report'
        OldLayoutImageService.new.swap_data_images_multiloc layout.craftjs_jsonmultiloc
      else
        LayoutImageService.new.swap_data_images layout.craftjs_json
      end
    end

    def after_create(layout, user)
      LogActivityJob.perform_later(layout, 'created', user, layout.created_at.to_i)
    end

    def before_update(layout, _user)
      # TODO: clean up after fully migrated
      layout.craftjs_jsonmultiloc = if layout.content_buildable_type == 'ReportBuilder::Report'
        OldLayoutImageService.new.swap_data_images_multiloc layout.craftjs_jsonmultiloc
      else
        LayoutImageService.new.swap_data_images layout.craftjs_json
      end
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
  end
end
