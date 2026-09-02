# frozen_string_literal: true

module ContentBuilder
  # Reads a project's or folder's description back off the Content Builder
  class BuildableDescriptionService
    def description_multiloc(buildable)
      layout = layout_for(buildable)
      return {} if layout.nil?

      Craftjs::VisibleTextualMultilocs.new(layout.craftjs_json.deep_dup)
        .extract_and_join
        .compact_blank
    end

    private

    def layout_for(buildable)
      code = layout_code(buildable)
      buildable.content_builder_layouts.find { |layout| layout.enabled && layout.code == code }
    end

    def layout_code(buildable)
      case buildable
      when Project then ProjectPageLayoutService::CODE
      when ProjectFolders::Folder then DescriptionLayoutService::LAYOUT_CODE_BY_TYPE.fetch('ProjectFolders::Folder')
      else raise ArgumentError, "Unsupported buildable: #{buildable.class.name}"
      end
    end
  end
end
