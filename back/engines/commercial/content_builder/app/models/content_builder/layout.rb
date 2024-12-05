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
    belongs_to :content_buildable, polymorphic: true, optional: true

    before_validation :set_craftjs_json, :sanitize_craftjs_json

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
      return if code != 'homepage'

      if craftjs_json.present?
        self.craftjs_json = ContentBuilder::LayoutImageService.new.swap_data_images(craftjs_json)
      else
        craftjs_filepath = Rails.root.join('config/homepage/default_craftjs.json.erb')
        json_craftjs_str = ERB.new(File.read(craftjs_filepath)).result(binding)
        self.craftjs_json = ContentBuilder::LayoutImageService.new.swap_data_images(JSON.parse(json_craftjs_str))
      end
    end
  end
end
