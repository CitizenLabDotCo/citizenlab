# frozen_string_literal: true

module ContentBuilder
  module Craftjs
    # Where a node is parented stays each service's own choice: `project_page` groups files
    # into columns, `custom_page` stacks them.
    module Nodes
      module_function

      EVENTS_WIDGET_NAME = 'EventsList'
      PROJECTS_WIDGET_NAME = 'ProjectsByFilter'

      def projects_by_filter(props, parent_id)
        {
          'type' => { 'resolvedName' => PROJECTS_WIDGET_NAME },
          'nodes' => [],
          'props' => props,
          'custom' => {
            'title' => {
              'id' => 'app.components.CustomPageBuilder.Widgets.ProjectsByFilter.filteredProjects',
              'defaultMessage' => 'Filtered projects'
            },
            'noPointerEvents' => true
          },
          'hidden' => false,
          'parent' => parent_id,
          'isCanvas' => false,
          'displayName' => PROJECTS_WIDGET_NAME,
          'linkedNodes' => {}
        }
      end

      def events(props, parent_id)
        {
          'type' => { 'resolvedName' => EVENTS_WIDGET_NAME },
          'nodes' => [],
          'props' => props,
          'custom' => {
            'title' => {
              'id' => 'app.components.admin.ContentBuilder.Widgets.Events.eventsListTitle',
              'defaultMessage' => 'Events'
            },
            'noPointerEvents' => true
          },
          'hidden' => false,
          'parent' => parent_id,
          'isCanvas' => false,
          'displayName' => EVENTS_WIDGET_NAME,
          'linkedNodes' => {}
        }
      end

      def file_attachment(file_id, parent_id)
        {
          'type' => { 'resolvedName' => 'FileAttachment' },
          'nodes' => [],
          'props' => { 'fileId' => file_id },
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.fileAttachment',
              'defaultMessage' => 'File Attachment'
            },
            'noPointerEvents' => true
          },
          'hidden' => false,
          'parent' => parent_id,
          'isCanvas' => false,
          'displayName' => 'FileAttachment',
          'linkedNodes' => {}
        }
      end
    end
  end
end
