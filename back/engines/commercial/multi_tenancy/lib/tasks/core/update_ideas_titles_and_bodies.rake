# frozen_string_literal: true

# Checks for nil values. Will skip update attempt and print error message if body field(s) empty.
# Example: $ rake demos:update_ideas_titles_and_bodies['/ideas_new_titles_and_bodies.csv','superdemo-en.demo.citizenlab.co','en']
namespace :demos do
  desc 'Update Ideas titles and body multilocs.'
  task :update_ideas_titles_and_bodies, %i[url host locale] => [:environment] do |_t, args|
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    locale = args[:locale]
    count = 0

    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      errors = []
      data.each do |d|
        idea = Idea.find_by id: d['id']

        if idea
          if d['title'].present? && d['body'].present?
            tm = idea.title_multiloc
            tm[locale] = d['title']
            b = idea.body_multiloc
            b[locale] = d['body']

            idea.update!(title_multiloc: tm, body_multiloc: b)

            count += 1
            puts "#{count}: title & body values updated for idea.id #{idea.id}."
          else
            errors += ["Body or title value missing for idea.id #{d['id']}"]
            puts "ERROR: Body or title value missing for idea.id #{d['id']}"
          end
        else
          errors += ["Couldn't find idea.id #{d['id']}"]
          puts "ERROR: Couldn't find idea.id #{d['id']}"
        end

        if errors.empty?
          puts "Success! #{count} ideas' title & body values updated."
        else
          puts 'Some errors occured!'
          errors.each { |l| puts l }
        end
      end
    end
  end
end
