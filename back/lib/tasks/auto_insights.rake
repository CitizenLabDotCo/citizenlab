# frozen_string_literal: true

require 'byebug'

namespace :auto_insights do
  desc 'Generate auto-insights cross-tenant'
  task generate: :environment do
    url_service = Frontend::UrlService.new
    analyses = []
    begin
      Tenant.with_lifecycle('active').all.each do |tenant|
        tenant.switch do
          next unless AppConfiguration.instance.feature_activated?('auto_insights')

          Analysis::Analysis.all.each do |analysis|
            next unless analysis.inputs.count > 100

            # next unless analysis.tags.count > 3
            # next unless analysis.heatmap_cells.empty?

            path = url_service.model_to_path(analysis)
            url = "http://#{tenant.host}.localhost:3000/#{path}"

            time = Benchmark.measure do
              Analysis::HeatmapGenerationJob.perform_now(analysis)
            end

            analyses << {
              url:,
              inputs_count: analysis.inputs.count,
              tags_count: analysis.tags.count,
              heatmap_cells_count: analysis.heatmap_cells.count,
              significant_cell_count: analysis.heatmap_cells.significant.count,
              time: time.to_h
            }

            # CSV.open('heatmap_generation.csv', 'w'){|row| data.each{|d| row << [d[:url],d[:inputs_count],d[:tags_count],d[:heatmap_cells_count],d[:significant_cell_count],d[:time][:real]]}}
          end
        end
      end
    ensure
      pp analyses
      puts analyses.count
    end
  end

  task :rerun, %i[tenant_host analysis_id] => [:environment] do |_t, args|
    Tenant.find_by!(host: args[:tenant_host]).switch do
      analysis = Analysis::Analysis.find(args[:analysis_id])
      url_service = Frontend::UrlService.new
      path = url_service.model_to_path(analysis)
      url = "http://#{Tenant.current.host}.localhost:3000/#{path}"

      time = Benchmark.measure do
        Analysis::HeatmapGenerationJob.perform_now(analysis)
      end

      puts "#{url} #{analysis.heatmap_cells.count} #{time.real}"
    end
  end

  task enable_ff: :environment do
    Tenant.safe_switch_each do |tenant|
      puts tenant.name
      configuration = AppConfiguration.instance
      next unless configuration.feature_activated?('large_summaries')

      settings = configuration.settings
      settings['auto_insights'] = {
        allowed: true,
        enabled: true
      }
      configuration.save!
    end
  end
end
