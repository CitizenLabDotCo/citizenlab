# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::PlatformTopic < AutoTaggingMethod::Base
    TAG_TYPE = 'platform_topic'

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      tags_by_name = analysis.tags.where(tag_type: TAG_TYPE).all.group_by(&:name)
      multiloc_service = MultilocService.new

      IdeasTopic
        .where(idea: analysis.inputs)
        .includes(:topic)
        .each do |idea_topic|
          tag_name = multiloc_service.t(idea_topic.topic.title_multiloc)
          if tags_by_name[tag_name].blank?
            tag = Tag.find_or_create_by(analysis: analysis, tag_type: TAG_TYPE, name: tag_name)
            Tagging.create!(input_id: idea_topic.idea_id, tag_id: tag.id)
            tags_by_name[tag_name] = [tag]
          else
            Tagging.create!(input_id: idea_topic.idea_id, tag_id: tags_by_name[tag_name].first.id)
          end
        end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end
  end
end
