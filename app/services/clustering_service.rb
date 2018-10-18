class ClusteringService

  def build_structure levels, idea_scope=Idea, options={}
    drop_empty = options[:drop_empty] == false ? false : true
    options = {drop_empty: drop_empty}
    output = {
      type: "custom",
      id: SecureRandom.uuid,
      children: create_children(
        levels, idea_scope.ids, 
        create_levels_to_ids(levels, idea_scope, options), 
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
        sql = %q(
        SELECT project_id, json_agg(id) AS idea_ids
        FROM ideas
        GROUP BY project_id;
        )
        ActiveRecord::Base.connection.execute(sql).map do |hash|
          [hash["project_id"], eval(hash["idea_ids"])]
        end.to_h
      when 'topic'
        sql = %q(
        SELECT topic_id, json_agg(ideas.id) AS idea_ids
        FROM ideas
        RIGHT OUTER JOIN ideas_topics
        ON ideas.id = idea_id
        GROUP BY topic_id;
        )
        ActiveRecord::Base.connection.execute(sql).map do |hash|
          [hash["topic_id"], eval(hash["idea_ids"])]
        end.to_h 
      when 'area'
        sql = %q(
        SELECT area_id, json_agg(ideas.id) AS idea_ids
        FROM ideas
        RIGHT OUTER JOIN areas_ideas
        ON ideas.id = idea_id
        GROUP BY area_id;
        )
        ActiveRecord::Base.connection.execute(sql).map do |hash|
          [hash["area_id"], eval(hash["idea_ids"])]
        end.to_h
      when 'clustering'
        nil       
      else
        raise "Unknown level #{levels.first}"
      end
      [level, level_ids_to_idea_ids] 
    end.to_h
  end

  def create_children levels, idea_ids, levels_to_ids, options
    if levels.present?
      level = levels.first
      if level == 'clustering'
        api = NLP::API.new(ENV.fetch("CL2_NLP_HOST"))
        dump = NLP::TenantDumpService.new.dump(Tenant.current)
        api.update_tenant(dump)
        clustering_items = api.ideas_clustering(
          Tenant.current.id, 
          Tenant.current.settings.dig('core','locales').first, 
          idea_ids: idea_ids
          ).parsed_response.dig('data','items')
        clustering_levels_to_ids = {}
        clustering_items.each do |item|
          clustering_levels_to_ids[item['cluster']] ||= []
          clustering_levels_to_ids[item['cluster']] += item['id']
        end
        clustering_levels_to_ids
      else
        levels_to_ids[level]
      end.map do |level_id, filter_idea_ids|
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

  def clustering_to_cluster cluster_id
    {
      type: "clustering",
      id: cluster_id
    }
  end
end