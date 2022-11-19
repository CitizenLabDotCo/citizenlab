# frozen_string_literal: true

module Insights
  class SideFxCategoryService
    include SideFxHelper

    def after_create(category, user)
      LogActivityJob.perform_later(category, 'created', user, category.created_at.to_i)
    end

    def after_update(category, user)
      LogActivityJob.perform_later(category, 'changed', user, category.updated_at.to_i)
    end

    def after_destroy(frozen_category, user)
      serialized_category = clean_time_attributes(frozen_category.attributes)
      LogActivityJob.perform_later(
        encode_frozen_resource(frozen_category),
        'deleted',
        user,
        Time.now.to_i,
        payload: { category: serialized_category }
      )
    end
  end
end
