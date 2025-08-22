# Usage:
#
# Dry run: rake single_use:add_layout_to_community_monitor_reports
# Execute: rake single_use:add_layout_to_community_monitor_reports[execute]
namespace :single_use do
  desc 'Add layout to community monitor reports'
  task :add_layout_to_community_monitor_reports, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'

    # TODO
  end
end