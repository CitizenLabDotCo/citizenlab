require 'yaml'


namespace :export_csv do
  desc "Export phases per project per tenant to CSV."
  task :project_phases => [:environment] do |t, args|
    max_phases = 0
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
         Project.all.each do |pj|
           max_phases = [max_phases,pj.phases.size].max
         end
      end
    end
    phases = []
    Tenant.all.each do |tenant|
      tenant_part = {
        'platform' => tenant.name,
        'platform type' => tenant.settings.dig('core','organization_type')
      }
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        Project.all.each do |pj| 
          project_part = tenant_part.merge({
            'platform name' => multiloc_to_singuloc(pj.title_multiloc)
          })
          phase_hashes = pj.phases.map do |ph|
            {
              'phase' => multiloc_to_singuloc(ph.title_multiloc)
            }
          end
          phases += [project_part.merge merge_phase_hashes(phase_hashes, ['phase'], max_phases)]
        end
      end
    end
    CSV.open('phases.csv', "wb") do |csv|
      csv << phases.first.keys
      phases.each do |d|
        csv << d.values
      end
    end
  end


  def multiloc_to_singuloc multiloc
    locale = ['en','fr','nl',''].map do |prefered_locale|
      multiloc.keys.select{|l| l.starts_with? prefered_locale}
    end.flatten.first
    multiloc[locale]
  end

  def merge_phase_hashes phase_hashes, keys, max_phases
    merged_hash = {}
    phase_hashes = phase_hashes.reverse
    max_phases.times do |i|
      next_phase = phase_hashes.pop
      keys.each do |key|
        merged_hash["#{key}_#{i}"] = next_phase && next_phase[key]
      end
    end
    merged_hash
  end

end