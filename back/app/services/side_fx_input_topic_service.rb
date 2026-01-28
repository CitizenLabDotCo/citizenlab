# frozen_string_literal: true

class SideFxInputTopicService
  include SideFxHelper

  def before_create(input_topic, user); end

  def after_create(input_topic, user)
    LogActivityJob.perform_later(input_topic, 'created', user, input_topic.created_at.to_i)
  end

  def before_update(input_topic, user); end

  def after_update(input_topic, user)
    LogActivityJob.perform_later(input_topic, 'changed', user, input_topic.updated_at.to_i)
  end

  def before_destroy(input_topic, _user)
    reassign_subtopic_ideas_to_parent(input_topic)
  end

  def after_destroy(frozen_input_topic, user)
    serialized_input_topic = clean_time_attributes(frozen_input_topic.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_input_topic),
      'deleted',
      user,
      Time.now.to_i,
      project_id: frozen_input_topic.project_id,
      payload: { input_topic: serialized_input_topic }
    )
  end

  private

  # When deleting a subtopic, reassign its ideas to the parent topic
  # but only if the idea has no sibling subtopics assigned
  def reassign_subtopic_ideas_to_parent(input_topic)
    parent_topic = input_topic.parent
    return if parent_topic.blank?

    sibling_topic_ids = parent_topic.children.where.not(id: input_topic.id).pluck(:id)

    input_topic.ideas.find_each do |idea|
      # Check if idea has any sibling subtopics assigned
      has_sibling_assigned = idea.input_topics.exists?(id: sibling_topic_ids)
      next if has_sibling_assigned

      # Assign to parent topic if not already assigned
      unless idea.input_topics.exists?(id: parent_topic.id)
        idea.ideas_input_topics.create!(input_topic: parent_topic)
      end
    end
  end
end
