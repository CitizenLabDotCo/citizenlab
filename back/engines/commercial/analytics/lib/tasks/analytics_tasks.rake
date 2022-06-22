# desc "Explaining what the task does"
# task :analytics do
#   # Task goes here
# end
#
namespace :analytics do
  namespace :refresh do
    desc "Refresh the materialized views for dimensions"
    task :dimensions => :environment do
      puts 'Refreshing dimension views'
    end

    desc "Refresh the materialized views for facts"
    task :facts => :environment do
      puts 'Refreshing fact views'
      # TODO: Currently saying 'analytics_fact_activities' does not exist - but it does
      Analytics::FactActivity.refresh
    end
  end
end