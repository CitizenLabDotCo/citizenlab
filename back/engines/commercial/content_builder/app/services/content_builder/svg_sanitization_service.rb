# frozen_string_literal: true

module ContentBuilder
  # Strips the executable content out of an SVG so it is safe to store and serve.
  #
  # An SVG is an XML document, not an opaque image: a browser runs the script it
  # contains when the file is opened at its own URL. Embedding it in an <img> tag
  # is safe, but uploaded files stay reachable by URL, so everything that can run
  # script or reach out to another document is removed here, before the file is
  # stored.
  class SvgSanitizationService
    class InvalidSvgError < StandardError; end

    # Elements that run script or embed a document of another type entirely.
    FORBIDDEN_ELEMENTS = %w[script foreignObject handler].freeze

    # References are limited to same-document fragments (how <use> and gradients
    # normally work) and inline raster data. That rules out `javascript:`, and
    # also remote references, which would leak the viewer's IP and let the icon
    # be changed after the fact from outside the platform.
    SAFE_HREF = %r{\A(?:#|data:image/(?:png|jpeg|gif|webp);base64,)}i

    # @param svg [String] the raw file contents
    # @return [String] the document with its executable content removed
    # @raise [InvalidSvgError] if the content is not an SVG document
    def sanitize(svg)
      doc = Nokogiri::XML(svg, &:nonet)
      raise InvalidSvgError, 'the file is not an SVG document' unless doc.root&.name == 'svg'

      # A doctype can declare entities (billion laughs, external file reads), and
      # an <?xml-stylesheet?> instruction pulls in a remote stylesheet. Neither
      # has a legitimate use in an uploaded icon.
      doc.internal_subset&.remove
      doc.xpath('//processing-instruction()').each(&:remove)

      doc.xpath('//*').each do |element|
        next element.remove if FORBIDDEN_ELEMENTS.include?(element.name)

        element.attribute_nodes.each { |attribute| attribute.remove if unsafe?(attribute) }
      end

      doc.to_xml
    end

    private

    # Both names are the local part, so the prefix a document happens to bind
    # xlink to does not matter.
    def unsafe?(attribute)
      name = attribute.name.downcase

      name.start_with?('on') || (name == 'href' && !SAFE_HREF.match?(attribute.value.to_s))
    end
  end
end
