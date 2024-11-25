namespace :embeddings do
  desc 'Populate embeddings for the ideas and proposals.'
  task :populate_ideas, %i[host project_slug] => [:environment] do |_t, args|
    reporter = ScriptReporter.new
    model = CohereMultilingualEmbeddings.new(region: 'eu-central-1')
    Apartment::Tenant.switch(args[:host].gsub('.', '_')) do
      project = Project.find_by!(slug: args[:project_slug])
      project.ideas.order(likes_count: :desc).each do |idea|
        puts "Processing idea #{idea.slug}"
        next if idea.embeddings_similarities.any?

        text = idea.title_multiloc.values.first + "\n" + Nokogiri::HTML(idea.body_multiloc.values.first).text
        embedding = model.embedding(text[...2048]) # 2048 is the character limit in the text
        embeddings_similarity = EmbeddingsSimilarity.new(idea: idea, embedding: embedding)
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
end