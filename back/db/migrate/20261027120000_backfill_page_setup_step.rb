# frozen_string_literal: true

# Provisioned layouts log no activity, so a logged create/change means an admin saved the page.
class BackfillPageSetupStep < ActiveRecord::Migration[7.2]
  def change
    reversible do |dir|
      dir.up do
        safety_assured do
          execute <<-SQL.squish
            UPDATE projects
            SET completed_setup_steps = completed_setup_steps || '["page"]'::jsonb
            WHERE NOT completed_setup_steps ? 'page'
            AND EXISTS (
              SELECT 1
              FROM content_builder_layouts layouts
              JOIN activities ON activities.item_type = 'ContentBuilder::Layout'
                AND activities.item_id = layouts.id
                AND activities.action IN ('created', 'changed')
              WHERE layouts.content_buildable_type = 'Project'
              AND layouts.content_buildable_id = projects.id
              AND layouts.code = 'project_page'
            )
          SQL
        end
      end
    end
  end
end
