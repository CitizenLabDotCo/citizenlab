module Tagging
  class TagService
    def remove_unused_tags
      Tag.all.each{ |tag| tag.destroy! if Tagging.where(tag_id: tag.id).empty? }
    end
  end
end
