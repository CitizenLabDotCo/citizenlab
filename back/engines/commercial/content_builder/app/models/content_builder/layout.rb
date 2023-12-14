# frozen_string_literal: true

# == Schema Information
#
# Table name: content_builder_layouts
#
#  id                     :uuid             not null, primary key
#  content_buildable_type :string           not null
#  content_buildable_id   :uuid             not null
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
    belongs_to :content_buildable, polymorphic: true

    before_validation :sanitize_craftjs_json

    validates :code, presence: true
    validates :craftjs_jsonmultiloc, multiloc: { presence: false, value_type: Hash }
    validates :craftjs_jsonmultiloc, length: { maximum: 1 }, if: lambda { |layout|
      layout.content_buildable_type == 'ReportBuilder::Report' # mvp of report builder only allows 1 locale
    }
    validate :validate_craftjs_jsonmultiloc

    def project_id
      content_buildable.try(:project_id)
    end

    private

    def validate_craftjs_jsonmultiloc
      validate_iframe_urls
    end

    def validate_iframe_urls
      url_starts = %w[http:// https://]

      craftjs_jsonmultiloc.each do |locale, json|
        LayoutService.new.select_craftjs_elements_for_types(json, ['Iframe']).each do |elt|
          url = elt.dig 'props', 'url'
          if url && url_starts.none? { |url_start| url.starts_with?(url_start) }
            errors.add :craftjs_jsonmultiloc, :iframe_url_invalid, locale: locale, url: url
          end
        end
      end
      LayoutService.new.select_craftjs_elements_for_types(craftjs_json, ['IframeMultiloc']).each do |elt|
        url = elt.dig 'props', 'url'
        if url && url_starts.none? { |url_start| url.starts_with?(url_start) }
          errors.add :craftjs_json, :iframe_url_invalid, url: url
        end
      end
    end

    def sanitize_craftjs_json
      # TODO: clean up after fully migrated
      self.craftjs_jsonmultiloc = LayoutSanitizationService.new.sanitize_multiloc craftjs_jsonmultiloc
      self.craftjs_json = LayoutSanitizationService.new.sanitize craftjs_json
    end
  end
end
