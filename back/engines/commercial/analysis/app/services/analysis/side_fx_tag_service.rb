# frozen_string_literal: true

module Analysis
  class SideFxTagService
    include SideFxHelper

    def after_create(tag, user)
      LogActivityJob.perform_later(tag, 'created', user, tag.created_at.to_i)
    end

    def after_update(tag, user)
      LogActivityJob.perform_later(tag, 'changed', user, tag.updated_at.to_i)
    end

    def before_destroy(tag, _user)
      delete_summary_tag_references(tag)
    end

    def after_destroy(frozen_tag, user)
      serialized_tag = clean_time_attributes(frozen_tag.attributes)
      LogActivityJob.perform_later(encode_frozen_resource(frozen_tag), 'deleted', user, Time.now.to_i, payload: { tag: serialized_tag })
    end

    private

    def delete_summary_tag_references(tag)
      Insight.delete_tag_references!(tag.id)
      AutoTaggingTask.delete_tag_references!(tag.id)
    end
  end
end
