module Insights
  class SideFxCategoryService
    include SideFxHelper

    def after_create(category, user)
      LogActivityJob.perform_later(category, 'created', user, category.created_at.to_i)
    end

    def after_update(category, user)
      LogActivityJob.perform_later(category, 'changed', user, category.updated_at.to_i)
    end

  end
end