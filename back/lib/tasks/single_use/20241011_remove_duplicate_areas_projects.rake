namespace :projects do
  desc 'Add the default proposals statuses and reorder all statuses.'
  task :remove_duplicate_areas_projects, [] => [:environment] do
    Tenant.safe_switch_each do |tenant|
      Rails.logger.info "Processing tenant: #{tenant.host}..."

      project_ids = Project.all.pluck(:id)
      aps = AreasProject.all

      project_ids.each do |project_id|
        areas_projects = aps.where(project_id: project_id)

        duplicate_area_ids = areas_projects.group(:area_id).having('count(area_id) > 1').pluck(:area_id)

        duplicate_area_ids.each do |area_id|
          count = areas_projects.where(area_id: area_id).count
          to_destroy = areas_projects.where(area_id: area_id).limit(count - 1)

          to_destroy.each do |ap|
            if ap.destroy
              Rails.logger.info "destroyed: #{ap.attributes}"
            else
              Rails.logger.info "Error: #{ap.errors.details}"
            end
          end
        end
      end
    end
  end
end
