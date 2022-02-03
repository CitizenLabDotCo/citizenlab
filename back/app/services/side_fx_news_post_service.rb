class SideFxNewsPostService
  include SideFxHelper

  def before_create(post, user); end

  def after_create(post, user)
    post.update! body_multiloc: TextImageService.new.swap_data_images(post, :body_multiloc)
    LogActivityJob.perform_later(post, 'created', user, post.created_at.to_i)
  end

  def before_update(post, _)
    post.body_multiloc = TextImageService.new.swap_data_images post, :body_multiloc
  end

  def after_update(post, user)
    LogActivityJob.perform_later(post, 'changed', user, post.updated_at.to_i)
  end

  def after_destroy(frozen_post, user)
    serialized_post = clean_time_attributes frozen_post.attributes
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_post), 'deleted',
      user, Time.now.to_i,
      payload: { news_post: serialized_post }
    )
  end
end
