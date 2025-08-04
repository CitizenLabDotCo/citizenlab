# frozen_string_literal: true

class CreateUniqueIndexOnContextAndRootJobTypeForDescriptionGenerationJobs < ActiveRecord::Migration[7.1]
  # This unique constraint prevents multiple +DescriptionGenerationJob+ jobs *with
  # tracking* from being enqueued for the same file. This helps keep the definition of
  # generation process status simpler for the initial implementation. To retry a job
  # (which we currently do not support in the product), the existing tracker must be
  # deleted first.
  def change
    add_index(
      :jobs_trackers,
      %i[context_type context_id root_job_type],
      unique: true,
      where: "root_job_type = 'Files::DescriptionGenerationJob'"
    )
  end
end
