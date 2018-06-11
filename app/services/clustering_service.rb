class ClusteringService

  def create_structure levels, idea_scope=Idea
    {
      "type" => "custom",
      "id" => SecureRandom.uuid,
      "children" => create_children(levels, idea_scope)
    }
  end

  def create_children levels, idea_scope
    case levels&.first
    when 'project'
      Project.all.pluck(:id).map do |project_id|
        {
          **project_to_cluster(project_id),
          "children" => create_children(levels.drop(1), idea_scope.where(project: project_id))
        }
      end
    when 'topic'
      Topic.all.pluck(:id).map do |topic_id|
        {
          **topic_to_cluster(topic_id),
          "children" => create_children(levels.drop(1), idea_scope.with_some_topics([topic_id]))
        }
      end
    when nil
      idea_scope.all.pluck(:id).map{|idea_id| idea_to_cluster(idea_id)}
    else
      raise "Unknown level #{levels.first}"
    end
  end

  def project_to_cluster project_id
    {
      type: "project",
      id: project_id
    }
  end

  def topic_to_cluster topic_id
    {
      type: "topic",
      id: topic_id
    }
  end

  def idea_to_cluster idea_id
    {
      type: "idea",
      id: idea_id
    }
  end
end