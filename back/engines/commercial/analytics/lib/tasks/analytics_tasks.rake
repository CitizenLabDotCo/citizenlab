# frozen_string_literal: true

namespace :analytics do
  desc 'Copies the view .sql files to the main codebase as scenic will need to run them from there'
  task copy_views: :environment do
    puts 'Copying analytics views out of engine'
    cp_r 'engines/commercial/analytics/db/views/.', 'db/views'
  end

  desc 'Populate date dimension table with dates from first post to six months in the future'
  task :populate_date_dimension, %i[host] => [:environment] do |_t, args|
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      dates_count = Analytics::DimensionDate.count(:all)
      to = Time.zone.today + 6.months

      if dates_count == 0
        first_idea = Idea.order(:created_at).limit(1).pluck(:created_at)
        first_initiative = Initiative.order(:created_at).limit(1).pluck(:created_at)
        first_post = [first_idea, first_initiative].min[0]
        next unless first_post

        from = first_post.to_datetime
      else
        last_date = Analytics::DimensionDate.order(date: :desc).limit(1).pluck(:date)
        from = last_date[0].to_datetime + 1.day
        next if from >= to
      end

      (from..to).each do |date|
        new_date = Analytics::DimensionDate.new
        new_date.date = date
        new_date.day = date.day
        new_date.month = date.month
        new_date.year = date.year
        new_date.save
      end
    end
  end

  desc 'Populate type dimension table with json rows'
  task :populate_type_dimension, %i[host types] => [:environment] do |_t, args|
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      types = args[:types].split('|').map { |type| type.split '%' }
      types.each do |name, parent|
        next if Analytics::DimensionType.exists?(name: name)

        new_type = Analytics::DimensionType.new
        new_type.name = name
        new_type.parent = parent == 'nil' ? nil : parent
        new_type.save
      end
    end
  end
end

Rake::Task['analytics:install:migrations'].enhance(['analytics:copy_views'])

Rake::Task['db:reset'].enhance do
  Tenant.not_deleted.each do |tenant|
    Rake::Task['analytics:populate_date_dimension'].execute(host: tenant.schema_name)
    Rake::Task['analytics:populate_type_dimension'].execute(host: tenant.schema_name, types: 'idea%post|initiative%post|comment%nil|vote%nil')
  end
end
