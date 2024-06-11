# frozen_string_literal: true

# Checks for nil values. Will skip update attempt and print error message if body or title field(s) empty.
# Example: $ rake demos:update_comments_bodies['/comments_new_bodies.csv','superdemo-en.demo.citizenlab.co','en']
namespace :demos do
  desc 'Update comments body multilocs.'
  task :update_comments_bodies, %i[url host locale] => [:environment] do |_t, args|
    data = CSV.parse(open(args[:url]).read, headers: true, col_sep: ',', converters: [])
    locale = args[:locale]
    count = 0

    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      errors = []
      data.each do |d|
        comment = Comment.find_by id: d['id']

        if comment
          if d['body'].present?
            b = comment.body_multiloc
            b[locale] = d['body']

            comment.update!(body_multiloc: b)

            count += 1
            puts "#{count}: body values updated for comment.id #{comment.id}."
          else
            errors += ["Body value missing for comment.id #{d['id']}"]
            puts "ERROR: Body value missing for comment.id #{d['id']}"
          end
        else
          errors += ["Couldn't find comment.id #{d['id']}"]
          puts "ERROR: Couldn't find comment.id #{d['id']}"
        end

        if errors.empty?
          puts "Success! #{count} comments' body values updated."
        else
          puts 'Some errors occured!'
          errors.each { |l| puts l }
        end
      end
    end
  end
end
