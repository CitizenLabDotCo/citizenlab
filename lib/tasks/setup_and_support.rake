
namespace :setup_and_support do

  desc "Mass official feedback"
  task :mass_official_feedback, [:url,:host,:locale] => [:environment] do |t, args|
    # ID, Feedback, Feedback Author Name, Feedback Email, New Status
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      data.each do |d|
        idea = Idea.find d['ID']
        first_name = idea.author&.first_name || idea.author_name.split(' ').first || ''
        byebug if !d['Feedback']
        d['Feedback'] = d['Feedback'].gsub '{{first_name}}', first_name
      end

      logs = []
      data.each_with_index do |d, i|
        idea = Idea.find d['ID']
        status = if d['New Status'].present?
          IdeaStatus.all.select{|i| i.title_multiloc[args[:locale]].downcase.strip == d['New Status'].downcase.strip}.first
        end
        name = d['Feedback Author Name']
        text = d['Feedback']
        user = User.find_by email: d['Feedback Email']
        if idea && status
          idea.idea_status = status
        idea.save!
        LogActivityJob.perform_later(idea, 'changed_status', user, idea.updated_at.to_i, payload: {change: idea.idea_status_id_previous_change})
        feedback = OfficialFeedback.create!(post: idea, body_multiloc: {args[:locale] => text}, author_multiloc: {args[:locale] => name}, user: user)
        LogActivityJob.perform_later(feedback, 'created', user, feedback.created_at.to_i)
        end
        logs += ["#{i}) Couldn't find idea #{d['ID']}"] if !idea
      end
      logs.each{|l| puts l} && true

    end
  end

  desc "Delete tenants through list of hostnames"
  task :delete_tenants, [:url] => [:environment] do |t, args|
    logs = []
    data.each do |host|
      tn = Tenant.find_by host: host
      if tn.present?
        SideFxTenantService.new.before_destroy(tn, nil)
        tn = tn.destroy
        if tn.destroyed?
          SideFxTenantService.new.after_destroy(tn, nil)
        else
          logs += ["Tenant #{host} could not be deleted"]
        end
      else
        logs += ["Tenant #{host} not found"]
      end
    end
    logs.each{|l| puts l} && true
  end
end