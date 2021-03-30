module Tagging
  module Patches
    module XlsxService
      def generate_idea_xlsx_columns(ideas, view_private_attributes: false, with_tags: false)
        columns = super
        if with_tags
          Tag.joins(:taggings).where({tagging_taggings: {idea_id: ideas.map(&:id)}}).each { |tag|
            columns.insert(3,{header: multiloc_service.t(tag.title_multiloc), f: -> (i) {
              tagging = Tagging.where(tag_id: tag.id, idea_id: i.id)
              !tagging.empty? ? tagging.first.confidence_score : '0'
              }})
          }
        end
        columns
      end
    end
  end
end
