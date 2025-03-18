# frozen_string_literal: true

class SlugService
  # @param [ApplicationRecord,nil] record if a record is specified, the generator can
  #   check for slug collisions with existing records of the same class.
  def generate_slug(record, string, excluded: [])
    return nil if string.blank?

    slug = base_slug = slugify(string)
    index = 1

    while slug.in?(excluded) || record&.class&.find_by(slug: slug)
      slug = "#{base_slug}-#{index}"
      index += 1
    end

    slug
  end

  # Returns an array of slugs corresponding to the given unpersisted records.
  # This will make sure there are no slug collisions among the given records.
  # This is useful to persist theses records all at once, e.g. in a
  # transaction, where the normal one by one slug generation would fail.
  # The given block must extract the string to base the slug on from one record
  def generate_slugs(unpersisted_records)
    return [] if unpersisted_records.blank?

    # Calculate slugs for every record individually
    slugs = unpersisted_records.map do |record|
      slugify(yield(record))
    end

    # Find the all the persisted duplicates
    claz = unpersisted_records.first.class
    db_occurences = claz
      .where('slug SIMILAR TO ?', "(#{slugs.join('|')})%")
      .pluck(:slug)

    # hash that will map vanilla slugs to the highest index found
    # e.g. {'john' => 3} if {slug: 'john-3'} exists
    max_i = {}

    slugs.map do |slug|
      # Fill in max_i for this slug
      unless max_i.key? slug
        max_i[slug] = db_occurences
          .filter_map { |dbo| dbo.match(/^#{slug}-(\d+)$/)&.then { |matches| matches[1] } }
          .map(&:to_i)
          .max || (db_occurences.include?(slug) ? 0 : nil)
      end

      # Generate the indexed slug from the vanilla slug
      if max_i[slug].nil?
        max_i[slug] = 0
        slug
      else
        [slug, '-', max_i[slug] += 1].join
      end
    end
  end

  def slugify(str)
    if TextUtils.latinish?(str)
      # `parametrize` transliterates (replaces ü with u) text.
      # It's more convenient, because URL looks the same everywhere (browser, text editor).
      # But proper transliteration is difficult (it should be configured for each language).
      # https://apidock.com/rails/v6.1.3.1/ActiveSupport/Inflector/transliterate
      # So, we transliterate only strings with latin characters.
      str.downcase.parameterize.tr('_', '-')
    else
      str.downcase.strip
        .gsub(/[^\p{L}\p{N}]+/, '-') # replace all characters that are not letters or numbers
        .gsub(/\A-+|-+\z/, '') # remove leading and trailing dashes
    end
  end
end
