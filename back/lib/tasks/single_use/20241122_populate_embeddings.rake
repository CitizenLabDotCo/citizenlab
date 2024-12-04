namespace :embeddings do
  desc 'Populate embeddings for the ideas and proposals.'
  task :populate_ideas, %i[host project_slug] => [:environment] do |_t, args|
    reporter = ScriptReporter.new
    model = CohereMultilingualEmbeddings.new
    Apartment::Tenant.switch(args[:host].gsub('.', '_')) do
      project = Project.find_by!(slug: args[:project_slug])
      project.ideas.order(likes_count: :desc).each do |idea|
        puts "Processing idea #{idea.slug}"
        next if idea.embeddings_similarities.any?

        text = idea.title_multiloc.values.first + "\n" + Nokogiri::HTML(idea.body_multiloc.values.first).text
        embedding = model.embedding(text[...2048]) # 2048 is the character limit in the text
        embeddings_similarity = idea.embeddings_similarities.new(embedding: embedding, embedded_attributes: 'title_body')
        if embeddings_similarity.save
          reporter.add_create(
            'EmbeddingsSimilarity',
            { idea_id: idea.id, embedding: embedding },
            context: { host: args[:host], project_slug: args[:project_slug] }
          )
        else
          reporter.add_error(
            embeddings_similarity.errors.details,
            context: { host: args[:host], project_slug: args[:project_slug], idea_id: idea.id }
          )
        end
      end
    end
    reporter.report!('populate_ideas_embeddings_report.json', verbose: true)
  end

  desc 'Generate results'
  task :generate_results, %i[host project_slug] => [:environment] do |_t, args|
    results = []
    Apartment::Tenant.switch(args[:host].gsub('.', '_')) do
      project = Project.find_by!(slug: args[:project_slug])
      project.ideas.order(likes_count: :desc).each.with_index(1) do |idea, row_idx|
        puts "Processing idea #{idea.slug}"
        next if idea.embeddings_similarities.none?

        similarities = EmbeddingsSimilarity.find_by(idea: idea).nearest_neighbors(:embedding, distance: 'cosine').limit(10).take(10)
        result = { 'Idea ID' => idea.id, 'Idea slug' => idea.slug, 'Idea title' => idea.title_multiloc.values.first, 'Idea body' => Nokogiri::HTML(idea.body_multiloc.values.first).text }
        similarities.each.with_index(1) do |similarity, index|
          result["Similar idea #{index} slug"] = similarity.idea.slug
          result["Similar idea #{index} title"] = similarity.idea.title_multiloc.values.first
          result["Similar idea #{index} body"] = Nokogiri::HTML(similarity.idea.body_multiloc.values.first).text
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