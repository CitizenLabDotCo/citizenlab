# Updates authors of ideas OR comments. For use in setting up a demo platform.
# 
# Expects url to refer to a CSV with a header row 'id,email' and the following values in the body rows:
# <id of comment or idea>, <email of author to be assigned to comment>
#
# The desired authors must exist and be registered with the platform.
# type: either 'idea' OR 'comment'
#
# Example: $ rake demos:update_authors_of_comments_or_ideas['idea','/ideas_new_authors.csv','superdemo-en.demo.citizenlab.co']
namespace :demos do
  desc "Update authors of comments or ideas"
  task :update_authors_of_comments_or_ideas, [:type, :url, :host, :locale] => [:environment] do |t, args|
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    count = 0

    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      errors = []
      record = nil

      data.each do |d|
        if args[:type] == 'idea'
          record = Idea.find_by id: d['id']
        elsif args[:type] == 'comment'
          record = Comment.find_by id: d['id']
        else
          errors += ["Unknown type #{args[:type]}"]
          puts "ERROR: Unknown type #{args[:type]}"
        end

        if record
          if d['email'].present?
            author = User.find_by(email: d['email'])
            
            if author
              if author.registration_completed_at.present?
                record.author_id = author.id
                if record.save
                  count += 1
                  puts "#{count}: Author #{author.id} assigned to record.id #{record.id}"
                else
                  errors += ["Unable to save author #{author.id} to record.id #{record.id}"]
                  puts "ERROR: Unable to save author #{author.id} to record.id #{record.id}"
                end
              else
                errors += ["Desired author #{d['email']} not registered"]
                puts "ERROR: Desired author #{d['email']} not registered"
              end
            end
          else
            errors += ["Email missing for record.id #{d['id']}"]
            puts "ERROR: Email missing for  record.id #{d['id']}"
          end
        else
          errors += ["Record not found, for record.id #{d['id']}"]
          puts "ERROR: Record not found, for record.id #{d['id']}"
        end

        unless errors.empty?
          puts "Some errors occured!"
          errors.each{ |e| puts e }
        end

        puts "#{count} records' authors updated."
      end
    end
  end
end
