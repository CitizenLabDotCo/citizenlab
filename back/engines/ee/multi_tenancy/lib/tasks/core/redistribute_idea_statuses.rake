# Redistributes idea status. For use in setting up a demo platform.
#
# Example: $ rake demos:redistribute_idea_statuses['superdemo-en.demo.citizenlab.co']
namespace :demos do
  desc "Redistribute idea statuses."
  task :redistribute_idea_statuses, [:host] => [:environment] do |t, args|
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      count = 0

      status_proposed    = IdeaStatus.find_by!(code: 'proposed')
      status_viewed      = IdeaStatus.find_by!(code: 'viewed')
      status_under_con   = IdeaStatus.find_by!(code: 'under_consideration')
      status_rejected    = IdeaStatus.find_by!(code: 'rejected')
      status_accepted    = IdeaStatus.find_by!(code: 'accepted')
      status_implemented = IdeaStatus.find_by!(code: 'implemented')
      
      Idea.all.each do |idea|
        status = case rand(99)
        when 0..49 then idea.update!(idea_status: status_proposed)
        when 50...80 then idea.update!(idea_status: status_viewed)
        when 81...90 then idea.update!(idea_status: status_under_con)
        when 91...95 then idea.update!(idea_status: status_rejected)
        when 96...98 then idea.update!(idea_status: status_accepted)
        when 99 then idea.update!(idea_status: status_implemented)
        end

        count += 1
      end

      puts "Success! #{count} ideas' status values updated."
    end
  end
end