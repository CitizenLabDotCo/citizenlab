# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::PlatformTopic < AutoTaggingMethod::Base
    TAG_TYPE = 'platform_topic'

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      tags_by_name = analysis.tags.where(tag_type: TAG_TYPE).all.index_by(&:name)
      multiloc_service = MultilocService.new

      IdeasInputTopic
        .where(idea: filtered_inputs)
        .includes(:input_topic)
        .each do |idea_input_topic|
          tag_name = multiloc_service.t(idea_input_topic.input_topic.full_title_multiloc)
          tags_by_name[tag_name] ||= Tag.find_or_create_by(analysis: analysis, tag_type: TAG_TYPE, name: tag_name)
          find_or_create_tagging!(input_id: idea_input_topic.idea_id, tag_id: tags_by_name[tag_name].id)
        end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end
  end
end
