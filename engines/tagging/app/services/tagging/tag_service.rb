module Tagging
  class TagService
    def remove_unused_tags
      p '/n'
      p '/n'
      p '/n'
      p '/n'
      p Tagging.where(tag_id: Tag.first.id).empty?
      p '/n'
      p '/n'
      p '/n'
      p '/n'
      Tag.all.each{ |tag| tag.destroy! if Tagging.where(tag_id: tag.id).empty? }
    end
  end
end
