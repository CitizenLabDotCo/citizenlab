class AddProjectIdToActivities < ActiveRecord::Migration[6.1]
  def change
    # We don't use a foreign key so we can keep grouping activities by project, even if
    # the project gets deleted.
    add_reference :activities, :project, type: :uuid
  end
end
