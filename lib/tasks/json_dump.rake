require 'json'


namespace :nlp do
  desc "Creates a json dump for NLP town, givent the tenant host as parameter."
  task :json_dump, [:host] => [:environment] do |t, args|
    host = args[:host]
    data = {host: host}
    Apartment::Tenant.switch(host.gsub('.', '_')) do
        data[:id]       = Tenant.current.id
        data[:name]     = Tenant.current.name
        data[:locales]  = Tenant.current.settings.dig('core','locales')
        data[:topics]   = encode_topics
        data[:ideas]    = encode_ideas
        data[:areas]    = encode_areas
        data[:projects] = encode_projects
    end
    File.open("tmp/#{data[:name]}_dump.json", 'w') {|f| f.write data.to_json }
  end

  def encode_topics
    Topic.all.map do |topic|
      d = {
        id:             topic.id,
        title_multiloc: topic.title_multiloc
      }
      d
    end
  end

  def encode_ideas
    Idea.published.all.map do |idea|
      d = {
        id:                   idea.id,
        title_multiloc:       idea.title_multiloc,
        body_multiloc:        idea.body_multiloc,
        project_id:           idea.project_id,
        author_name:          idea.author_name,
        location_description: idea.location_description,
        topics:               idea.topics.map{|top| top.id},
        areas:                idea.areas.map{|ar| ar.id},
        upvotes_count:        idea.upvotes_count,
        downvotes_count:      idea.downvotes_count,
        comments:             encode_comments(idea)
      }
      d
    end
  end

  def encode_comments idea
    children_map = idea.comments.map{|c| [c.id,[]]}.to_h
    idea.comments.each do |c|
      if c.parent_id
        children_map[c.parent_id] += [c]
      end
    end
    loop_encode_comments idea.comments.where(parent_id: nil), children_map
  end

  def loop_encode_comments comments, children_map
    comments.sort_by{|c| c.created_at.to_i}.map do |c|
      {
        id:            c.id,
        created_at:    c.created_at.to_s,
        body_multiloc: c.body_multiloc,
        author_name:   c.author_name,
        comments:      loop_encode_comments(children_map[c.id], children_map)
      }
    end
  end

  def encode_areas
    Area.all.map do |area|
      d = {
        id:                   area.id,
        title_multiloc:       area.title_multiloc,
        description_multiloc: area.description_multiloc
      }
      d
    end
  end

  def encode_projects
    Project.all.map do |project|
      d = {
        id:                   project.id,
        title_multiloc:       project.title_multiloc,
        description_multiloc: project.description_multiloc,
        topics:               project.topics.map{|top| top.id},
        areas:                project.areas.map{|ar| ar.id}
      }
      d
    end
  end

end