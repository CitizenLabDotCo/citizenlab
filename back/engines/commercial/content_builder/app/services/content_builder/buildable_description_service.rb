# frozen_string_literal: true

module ContentBuilder
  # Reads a project's or folder's description back off the Content Builder, in the shape
  # the `description_multiloc` column used to hold. Only the text widgets carry over; an
  # image or embed widget of its own has nowhere to go in a plain HTML description.
  class BuildableDescriptionService
    def description_multiloc(buildable)
      layout = layout_for(buildable)
      return {} if layout.nil?

      # `VisibleTextualMultilocs` sanitizes the craftjs in place, so hand it a copy. It
      # also emits an entry per platform locale; the empty ones have to go, or
      # `MultilocService#t` reads them as a translation and stops falling back.
      Craftjs::VisibleTextualMultilocs.new(layout.craftjs_json.deep_dup)
        .extract_and_join
        .compact_blank
    end

    private

    # Scans the association rather than querying it, so a preloaded
    # `content_builder_layouts` keeps a list endpoint free of a query per record.
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
