require 'yaml'


namespace :fix_templates do
  desc "Fix overlap in phases in templates."
  task :overlapping_phases => [:environment] do |t, args|
    Dir[Rails.root.join('config', 'tenant_templates', '*.yml')].map do |file|
      template = YAML.load_file(file)
      if template['models']['phase']
        template['models']['phase'] = fix_overlapping_phases template['models']['phase'], file
        File.open("#{file.split('.').first}_copy.yml", 'w') {|f| f.write template.to_yaml }
      end
    end
  end

  def fix_overlapping_phases phase_hs, file
    # group phases by project
    phases_by_project = {}
    phase_hs.each do |phase_h|
      phases_by_project[phase_h['project_ref']] = (phases_by_project[phase_h['project_ref']] || []) + [phase_h]
    end
    # sort phases of each project by start time
    phases_by_project.each do |key, phase_hs|
      phases_by_project[key] = phase_hs.sort do |phase_h|
        phase_h['start_at']
      end.reverse
    end
    # reset timestamps to ensure there is no more overlap
    phases_by_project.each do |key, phase_hs|
      t = nil
      phase_hs.each do |phase_h|
        t = (t && (t + 1.day)) || phase_h['start_at']
        phase_h['start_at'] = t
        t += (rand(30)+1).days
        phase_h['end_at'] = t
      end
    end
    # return the new phases
    phases_by_project.values.flatten
  end


  task :list_phase_overlaps => [:environment] do |t, args|
    overlaps = []
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        Project.all.each do |pj|
          overlapping_phases = {}
          phase_stack = pj.phases.sort_by(&:start_at).reverse
          prev_phase = nil
          while !phase_stack.empty?
            cur_phase = phase_stack.pop
            if prev_phase && (prev_phase.end_at == cur_phase.start_at) && (cur_phase.end_at != cur_phase.start_at)
              prev_phase.end_at = prev_phase.end_at - 1.day
              if prev_phase.save
                overlapping_phases[prev_phase.id][:new_end_at] = prev_phase.end_at
                overlapping_phases[prev_phase.id][:error_message] = nil
              end
            end
            if !cur_phase.valid?
              overlapping_phases[cur_phase.id] = {
                host: tenant.host, project: pj.slug, 
                phase: cur_phase.title_multiloc.values.first, 
                start_at: cur_phase.start_at, end_at: cur_phase.end_at,
                new_end_at: nil, error_message: cur_phase.errors.full_messages.join(', ')
              }
            end
            prev_phase = cur_phase
          end
          overlaps += overlapping_phases.values
        end
      end
    end
    CSV.open('overlaps.csv', "wb") do |csv|
      csv << overlaps.first.keys
      overlaps.each do |d|
        csv << d.values
      end
    end
  end

end