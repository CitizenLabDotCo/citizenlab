# frozen_string_literal: true

require 'nanoid'

module ContentBuilder
  module Craftjs
    class DefaultLayoutService
      def default_layout(content_buildable)
        case content_buildable.class.name
        when 'Project'
          project_layout(content_buildable)
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
              titleMultiloc: {
                en: 'Published projects',
                'fr-BE': 'Published projects',
                'nl-BE': 'Published projects'
              }
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
            props: { text: { en: '<p>yeah this is a project folder</p>' } },
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

      def project_layout(_project)
        {}
      end
    end
  end
end
