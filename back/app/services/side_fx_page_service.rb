class SideFxPageService
  include SideFxHelper

  def before_create page, user; end

  def after_create page, user
    page.update!(body_multiloc: TextImageService.new.swap_data_images(page, :body_multiloc))
    LogActivityService.new.run(page, 'created', user, page.created_at.to_i)
  end

  def before_update page, user
    page.body_multiloc = TextImageService.new.swap_data_images(page, :body_multiloc)
  end

  def after_update page, user
    LogActivityService.new.run(page, 'changed', user, page.updated_at.to_i)
  end

  def after_destroy frozen_page, user
    serialized_page = clean_time_attributes(frozen_page.attributes)
    LogActivityService.new.run(encode_frozen_resource(frozen_page), 'deleted', user, Time.now.to_i, payload: {page: serialized_page})
  end

end