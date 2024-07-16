# frozen_string_literal: true

namespace :single_use do
  desc <<~DESC
    Populates the project_id column of activities (SQL implementation)

    It only processes item types that have the project_id column.
  DESC
  task :add_project_id_to_activities_sql, [:tenant_id] => [:environment] do |_task, args|
    Rails.application.eager_load!

    models_with_project_id_col = ActiveRecord::Base.descendants.select do |klass|
      klass.column_names.include?('project_id')
    rescue Exception # rubocop:disable Lint/RescueException
      puts({ message: 'skipping model', model: klass.name })
      false
    end

    tenant_id = args[:tenant_id]
    tenants = tenant_id ? Tenant.where(id: tenant_id) : Tenant

    tenants.find_each do |tenant|
      tenant.switch do
        total_nb_records = 0
        models_with_project_id_col.each do |model_class|
          puts({ tenant_id: tenant.id, message: 'processing item type', item_type: model_class.name }.to_json)

          query = <<-SQL.squish
          UPDATE activities
          SET project_id = items.project_id
          FROM #{model_class.table_name} items
          WHERE activities.item_id = items.id 
          AND activities.item_type = '#{model_class.name}'
          AND items.project_id IS NOT NULL;
          SQL

          nb_records = Activity.connection.exec_update(query)
          total_nb_records += nb_records
          puts({ tenant_id: tenant.id, message: 'processed item type', item_type: model_class.name, nb_records: nb_records }.to_json)
        end
      rescue StandardError => e
        puts({ tenant_id: tenant.id, message: 'failure', nb_records: total_nb_records, error: e, backtrace: e.backtrace }.to_json)
      else
        puts({ tenant_id: tenant.id, message: 'success', nb_records: total_nb_records }.to_json)
      end
    end
  end

  desc <<~DESC
    Populates the project_id column of activities (Rails)

    It processes all item types that are not covered by `add_project_id_to_activities_sql`,
    but it is pretty aggressive on the DB.
  DESC
  task :add_project_id_to_activities_rails, %i[tenant_id model_class] => [:environment] do |_task, args|
    Rails.application.eager_load!

    # Models without `project_id` column that support the `project_id` method.
    model_classes = if args[:model_class]
      [args[:model_class].constantize]
    else
      ActiveRecord::Base.descendants.select do |klass|
        klass.new.respond_to?(:project_id) && klass.column_names.exclude?('project_id')
      rescue Exception # rubocop:disable Lint/RescueException
        puts({ message: 'skipping model', model: klass.name })
        false
      end
    end

    tenant_id = args[:tenant_id]
    tenants = tenant_id ? Tenant.where(id: tenant_id) : Tenant

    tenants.find_each do |tenant|
      tenant.switch do
        total_nb_records = 0

        model_classes.each do |model_class|
          puts({ tenant_id: tenant.id, message: 'processing item type', item_type: model_class.name }.to_json)

          items = model_class.joins("JOIN activities ON activities.item_id = #{model_class.table_name}.id")
            .where(activities: { project_id: nil })
            .distinct

          nb_records = 0
          items.find_each do |item|
            nb_records += Activity.where(item_type: model_class.name, item_id: item.id, project_id: nil)
              .update_all(project_id: item.project_id)
          end

          puts({ tenant_id: tenant.id, message: 'processed item type', item_type: model_class.name, nb_records: nb_records }.to_json)
          total_nb_records += nb_records
        end
      rescue StandardError => e
        puts({ tenant_id: tenant.id, message: 'failure', nb_records: total_nb_records, error: e, backtrace: e.backtrace }.to_json)
      else
        puts({ tenant_id: tenant.id, message: 'success', nb_records: total_nb_records }.to_json)
      end
    end
  end
end
