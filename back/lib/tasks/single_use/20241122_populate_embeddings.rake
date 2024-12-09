namespace :embeddings do
  desc 'Populate embeddings for the ideas and proposals.'
  task :populate_ideas, %i[host project_slug] => [:environment] do |_t, args|
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      project = Project.find_by!(slug: args[:project_slug])
      project.ideas.order(likes_count: :desc).each do |idea|
        puts "Processing idea #{idea.slug}"
        SimilarIdeasService.new(idea).upsert_embedding!
      end
    end
  end

  desc 'Generate results'
  task :generate_results, %i[host project_slug] => [:environment] do |_t, args|
    results = []
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      project = Project.find_by!(slug: args[:project_slug])
      project.ideas.order(likes_count: :desc).each.with_index(1) do |idea, row_idx|
        puts "Processing idea #{idea.slug}"
        next if idea.embeddings_similarities.none?

        result = { 'Idea ID' => idea.id, 'Idea slug' => idea.slug, 'Idea title' => idea.title_multiloc.values.first, 'Idea body' => Nokogiri::HTML(idea.body_multiloc.values.first).text }
        SimilarIdeasService.new(idea).similar_ideas.each.with_index(1) do |similar_idea, index|
          result["Similar idea #{index} slug"] = similar_idea.slug
          result["Similar idea #{index} title"] = similar_idea.title_multiloc.values.first
          result["Similar idea #{index} body"] = Nokogiri::HTML(similar_idea.body_multiloc.values.first).text
        end
        results << result

        if row_idx % 10 == 0
          CSV.open('similar_ideas.csv', 'wb') do |csv|
            csv << results.first.keys
            results.each do |d|
              csv << d.values
            end
          end
        end
      end
    end
  end
end
