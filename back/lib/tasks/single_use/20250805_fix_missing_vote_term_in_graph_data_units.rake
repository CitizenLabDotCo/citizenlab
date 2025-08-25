namespace :single_use do
  desc 'Fix missing vote_term in graph data units, which was forgotton to be updated when introducing the vote term'
  task :fix_missing_vote_term_in_graph_data_units => :environment do |_t, _args|
    Tenant.safe_switch_each do |tenant|
      puts "\nProcessing tenant #{tenant.host} \n\n"

      data_units = ReportBuilder::PublishedGraphDataUnit.where("data->'phase' IS NOT NULL AND data->'phase'->'vote_term' IS NULL")

      data_units.each do |data_unit|
        builder = ReportBuilder::ReportPublisher.new(data_unit.report, data_unit.report.owner)
        builder.publish
      end
    end
  end
end
