# Checks for nil values. Will skip update attempt and print error message if body field(s) empty.
# Example: $ rake cl2_back:update_ideas_titles_and_bodies['/ideas_new_titles_and_bodies.csv','superdemo-en.demo.citizenlab.co','en']
namespace :cl2_back do
  desc "Update Ideas titles and body multilocs."
  task :update_ideas_titles_and_bodies, [:url, :host, :locale] => [:environment] do |t, args|
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    locale = args[:locale]
    count = 0
  
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      errors = []
      data.each do |d|
        idea = Idea.find_by id: d['id']

        if idea
          if d['title'] != nil && d['title'] != '' && d['body'] != nil && d['body'] != ''
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
  
        if errors.length > 0
          puts "Some errors occured!"
          errors.each{|l| puts l}
        else
          puts "Success! #{count} ideas' title & body values updated."
        end
      end
    end
  end
end
