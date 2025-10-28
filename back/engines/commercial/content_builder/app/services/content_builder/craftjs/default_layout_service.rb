# frozen_string_literal: true

require 'nanoid'

module ContentBuilder
  module Craftjs
    class DefaultLayoutService
      def default_layout(content_buildable)
        case content_buildable.class.name
        when 'ProjectFolders::Folder'
          folder_layout(content_buildable)
        else
          {}
        end
      end

      private

      def folder_layout(folder)
        {
          ROOT: {
            type: 'div',
            nodes: %w[TEXT PUBLISHED_PROJECTS],
            props: { id: 'e2e-content-builder-frame' },
            custom: {},
            hidden: false,
            isCanvas: true,
            displayName: 'div',
            linkedNodes: {}
          },
          PUBLISHED_PROJECTS: {
            type: { resolvedName: 'Published' },
            nodes: [],
            props: {
              folderId: folder.id,
              titleMultiloc: MultilocService.new.i18n_to_multiloc('projects.published_projects')
            },
            custom: {},
            hidden: false,
            parent: 'ROOT',
            isCanvas: false,
            displayName: 'Published',
            linkedNodes: {}
          },
          TEXT: {
            type: { resolvedName: 'TextMultiloc' },
            nodes: [],
            props: { text: folder.description_multiloc || {} },
            custom: {
              title: {
                id: 'app.containers.admin.ContentBuilder.textMultiloc',
                defaultMessage: 'Text'
              }
            },
            hidden: false,
            parent: 'ROOT',
            isCanvas: false,
            displayName: 'TextMultiloc',
            linkedNodes: {}
          }
        }
      end
    end
  end
end
