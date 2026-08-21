# frozen_string_literal: true

# Publishing a project used to bypass its pending review instead of resolving it, so projects
# published straight from draft kept a review pending forever: it still shows as pending in the
# admin UI, so this task removes the ones left behind.

namespace :single_use do
  desc 'Remove pending reviews for published projects'
  task :remove_pending_reviews_for_published_projects, %i[execute host] => :environment do |_t, args|
    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Remove pending reviews for published projects ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    TenantScript.run(
      'remove_pending_reviews_for_published_projects',
      args: args,
      description: 'remove pending reviews for published projects'
    ) do |tenant, script|
      ProjectReview.where(approved_at: nil)
        .joins(project: :admin_publication)
        .where.not(admin_publications: { first_published_at: nil })
        .find_each do |review|
        puts "Removing pending review #{review.id} for project #{review.project_id}"
        script.reporter.add_delete('ProjectReview', review.id, context: { tenant: tenant.host, project_id: review.project_id })
        review.destroy! if script.execute?
      end
    end

    puts "\n---------- FINISHED TASK: Remove pending reviews for published projects ----------\n\n"
  end
end
