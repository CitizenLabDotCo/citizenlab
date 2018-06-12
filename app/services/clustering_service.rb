class ClusteringService

  def build_structure levels, idea_scope=Idea, options={}
    drop_empty = options[:drop_empty] == false ? false : true
    output = {
      type: "custom",
      id: SecureRandom.uuid,
      children: create_children(levels, idea_scope, {drop_empty: drop_empty})
    }

    output = drop_empty_clusters(output) if drop_empty

    output
  end

  private

  def create_children levels, idea_scope, options
    case levels&.first
    when 'project'
      Project.all.pluck(:id).map do |project_id|
        {
          **project_to_cluster(project_id),
          children: create_children(levels.drop(1), idea_scope.where(project: project_id), options)
        }
      end
    when 'topic'
      Topic.all.pluck(:id).map do |topic_id|
        {
          **topic_to_cluster(topic_id),
          children: create_children(levels.drop(1), idea_scope.with_some_topics([topic_id]), options)
        }
      end
    when nil
      idea_scope.all.pluck(:id).map{|idea_id| idea_to_cluster(idea_id)}
    else
      raise "Unknown level #{levels.first}"
    end
  end

  def drop_empty_clusters clustering
    if !clustering[:children]
      clustering
    else
      children = clustering[:children]
        .map{|c| drop_empty_clusters(c)}
        .compact
      if children.empty? 
        nil
      else
        {
          **clustering,
          children: children
        }
      end
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