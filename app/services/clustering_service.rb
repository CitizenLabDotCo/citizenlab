class ClusteringService

  def build_structure levels, idea_scope=Idea, options={}
    drop_empty = options[:drop_empty] == false ? false : true
    options = {drop_empty: drop_empty}
    output = {
      type: "custom",
      id: SecureRandom.uuid,
      children: create_children(
        levels, idea_scope, 
        create_levels_to_ids(levels, idea_scope.pluck(:id), options), 
        options
        )
    }

    output = drop_empty_clusters(output) if drop_empty

    output
  end


  private

  def create_levels_to_ids levels, idea_scope, options
    levels.map do |level|
      level_ids_to_idea_ids = case level
      when 'project'
        Project.all.pluck(:id).map do |project_id|
          [project_id, idea_scope.where(project: project_id).pluck(:id)]
        end.to_h
      when 'topic'
        Topic.all.pluck(:id).map do |topic_id|
          [topic_id, idea_scope.with_some_topics([topic_id]).pluck(:id)]
        end.to_h 
      when 'area'
        Area.all.pluck(:id).map do |area_id|
          [area_id, idea_scope.with_some_areas([area_id]).pluck(:id)]
        end.to_h      
      else
        raise "Unknown level #{levels.first}"
      end
      [level, level_ids_to_idea_ids] 
    end.to_h
  end

  def create_children levels, idea_ids, levels_to_ids, options
    if levels.present?
      level = levels.first
      levels_to_ids[level].map do |level_id, filter_idea_ids|
        clustering = nil
        begin
          clustering = self.send "#{level}_to_cluster",level_id
        rescue NoMethodError => e
          raise "Unknown level #{level}"
        end
        clustering[:children] = create_children levels.drop(1), (idea_ids & filter_idea_ids), levels_to_ids, options
        clustering
      end
    else
      idea_ids.map{|idea_id| idea_to_cluster(idea_id)}
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

  def area_to_cluster area_id
    {
      type: "area",
      id: area_id
    }
  end

  def idea_to_cluster idea_id
    {
      type: "idea",
      id: idea_id
    }
  end
end