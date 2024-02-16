class AddGeneratedAtToInsightables < ActiveRecord::Migration[7.0]
  def change
    succeeded_job_ids = ActiveRecord::Base.connection.execute("SELECT id FROM analysis_background_tasks WHERE state = 'succeeded'").pluck 'id'
    %i[analysis_summaries analysis_questions].each do |table|
      add_column table, :generated_at, :timestamp
      if succeeded_job_ids.present?
        ActiveRecord::Base.connection.execute "UPDATE #{table} SET generated_at = created_at WHERE background_task_id IN (#{succeeded_job_ids.map { |id| "'#{id}'" }.join(', ')})"
      end
    end
  end
end
