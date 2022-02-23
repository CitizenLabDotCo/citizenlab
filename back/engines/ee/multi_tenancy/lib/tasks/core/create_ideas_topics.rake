# Intended for use in setting up DEMO platforms only!
namespace :demos do
  desc 'Create Ideas Topics.'
  task :create_ideas_topics, %i[url host locale] => [:environment] do |_t, args|
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    locale = args[:locale]
    count = 0

    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      errors = []
      data.each do |d|
        idea = Idea.find_by id: d['id']

        if idea
          topics = d['topics']
          # Because of the way colums are concatenated in the Excel file,
          # we need to strip any leading or tailing semicolons + spaces
          topics = topics[1..].strip if topics[0] == ';'
          topics = topics[0..-2].strip if topics[-1] == ';'
          topics = topics.strip.split(';')

          topics.each do |tp|
            topic = Topic.find_by("title_multiloc @> '{\"#{locale}\":\"#{tp.strip}\"}'")
            if topic
              IdeasTopic.create!(idea: idea, topic: topic)
            else
              errors += ["Couldn't find topic #{tp}"]
              puts "ERROR: Couldn't find topic #{tp}"
            end
          end

          count += 1
        else
          errors += ["Couldn't find idea #{d['id']}"]
          puts "ERROR: Couldn't find idea #{d['id']}"
        end
      end

      if errors.any?
        puts 'Some errors occured!'
        errors.each { |e| puts e }
      else
        puts "Success! Topics added to #{count} Ideas."
      end
    end
  end
end
