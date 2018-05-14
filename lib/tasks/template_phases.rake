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
    overlaps = {}
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        project_overlaps = {}
        Project.all.each do |pj|
          pj.phases.each do |ph|
            ph.presentation_mode = 'card' #####
            if !ph.valid?
              project_overlaps[pj.slug] = (project_overlaps[pj.slug] || []) + [ph]
            end
          end
        end
        if project_overlaps.present?
          overlaps[tenant.host] = (overlaps[tenant.host] || []) + [project_overlaps]
        end
      end
    end
    overlaps.each do |host, project_overlaps|
      puts "-------"
      puts "Overlapping phases for tenant #{host}:"
      project_overlaps.each do |pj_h|
        pj_h.each do |pj_name, phases|
          puts "  In project #{pj_name}:"
          phases.each do |ph|
            puts "    - #{ph.title_multiloc.values.first}"
            puts "      #{ph.start_at}-#{ph.end_at}"
          end
        end
      end
      puts "-------\n\n"
    end
  end

end