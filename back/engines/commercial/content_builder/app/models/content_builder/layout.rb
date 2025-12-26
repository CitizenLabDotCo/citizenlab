# frozen_string_literal: true

# == Schema Information
#
# Table name: content_builder_layouts
#
#  id                     :uuid             not null, primary key
#  content_buildable_type :string
#  content_buildable_id   :uuid
#  code                   :string           not null
#  enabled                :boolean          default(FALSE), not null
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  craftjs_json           :jsonb            not null
#
# Indexes
#
#  index_content_builder_layouts_content_buidable_type_id_code  (content_buildable_type,content_buildable_id,code) UNIQUE
#
module ContentBuilder
  class Layout < ApplicationRecord
    include Files::FileAttachable
    TEXT_CRAFTJS_NODE_TYPES = %w[TextMultiloc AccordionMultiloc].freeze

    belongs_to :content_buildable, polymorphic: true, optional: true

    before_validation :swap_data_images, on: :create
    before_validation :set_craftjs_json, :sanitize_craftjs_json
    before_validation :process_file_attachments, on: :update

    validates :code, presence: true
    validate :validate_iframe_urls

    scope :with_widget_type, lambda { |*widget_types|
      with_widget = joins('CROSS JOIN jsonb_each(content_builder_layouts.craftjs_json) AS jsonb_each')
        .where("jsonb_each.value->'type'->>'resolvedName' in (?)", widget_types)
        .select(:id)

      where(id: with_widget)
    }

    def project_id
      content_buildable.try(:project_id)
    end

    # Creates and persists a copy of the layout, including all the images ({LayoutImage})
    # associated with it. The newly created layout is not associated with any content
    # buildable.
    # @return [Layout] the duplicated layout.
    def duplicate!
      dup.tap do |layout|
        transaction do
          LayoutImageService.new.image_elements(layout.craftjs_json).each do |img_elt|
            layout_image_copy = LayoutImage.find_by(code: img_elt['dataCode']).duplicate!
            img_elt['dataCode'] = layout_image_copy.code
          end

          layout.content_buildable = nil
          layout.save!
        end
      end
    end

    private

    def validate_iframe_urls
      url_starts = %w[http:// https://]

      LayoutService.new.select_craftjs_elements_for_types(craftjs_json, ['IframeMultiloc']).each do |elt|
        url = elt.dig 'props', 'url'
        if url && url_starts.none? { |url_start| url.starts_with?(url_start) }
          errors.add :craftjs_json, :iframe_url_invalid, url: url
        end
      end
    end

    def sanitize_craftjs_json
      self.craftjs_json = LayoutSanitizationService.new.sanitize craftjs_json
    end

    def set_craftjs_json
      return if code != 'homepage' || craftjs_json.present?

      craftjs_filepath = Rails.root.join('config/homepage/default_craftjs.json.erb')
      json_craftjs_str = ERB.new(File.read(craftjs_filepath)).result(binding)
      self.craftjs_json = ContentBuilder::LayoutImageService.new.swap_data_images(JSON.parse(json_craftjs_str))
    end

    # This ensures we process image data in a homepage layout created from the internal templates
    def swap_data_images
      return if code != 'homepage' || craftjs_json.blank?

      self.craftjs_json = ContentBuilder::LayoutImageService.new.swap_data_images(craftjs_json)
    end

    # Process file attachments in the craftjs_json, ensuring this happens in the same transaction
    # as the layout save. This will:
    # 1. Cleanup orphaned attachments (attachments no longer referenced in the JSON)
    # 2. Create new file attachments and inject their IDs into the craftjs_json
    def process_file_attachments
      return if craftjs_json.blank?

      self.craftjs_json = ContentBuilder::FileAttachmentProcessorService.new(self).process_file_attachments
    end
  end
end
