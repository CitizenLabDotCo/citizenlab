# frozen_string_literal: true

module ContentBuilder
  module Craftjs
    # Node shapes shared by the layout services. Where a node is parented stays each
    # service's own choice: the project page groups files into columns, a custom page stacks
    # them.
    module Nodes
      module_function

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
