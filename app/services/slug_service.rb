class SlugService

  def generate_slug record, title
    slug = slugify(title)
    indexedSlug = nil
    i=0
    while record.class.find_by(slug: indexedSlug || slug)
      i +=1
      indexedSlug = [slug, '-', i].join
    end
    indexedSlug || slug
  end


  # Returns an array of slugs corresponding to the given unpersisted records.
  # This will make sure there are no slug collisions among the given records.
  # This is useful to persist theses records all at once, e.g. in a
  # transaction, where the normal one by one slug generation would fail.
  # The given block must extract the string to base the slug on from one record
  def generate_slugs unpersisted_records, &block
    # Calculate slugs for every record individually
    slugs = unpersisted_records.map do |record|
      slugify(block.call(record)) 
    end

    # Find the all the persisted duplicates
    claz = unpersisted_records&.first.class
    db_occurences = slugs.drop(1).inject(claz.where('slug LIKE ?', "#{slugs[0]}%")) do |scope, slug|
      scope.or(claz.where('slug LIKE ?', "#{slug}%"))
    end.pluck(:slug)

    # hash that will map vanilla slugs to the highest index found
    # e.g. {'john' => 3} if {slug: 'john-3'} exists
    max_i = {}

    slugs.map do |slug|
      # Fill in max_i for this slug
      unless max_i.has_key? slug
        max_i[slug] = db_occurences
          .map{|dbo| dbo.match(/^#{slug}\-(\d+)$/)&.yield_self{|matches| matches[1]}}
          .compact
          .map(&:to_i)
          .max || (db_occurences.include?(slug) ? 0 : nil)
      end

      # Generate the indexed slug from the vanilla slug
      if max_i[slug].nil?
        max_i[slug] = 0
        slug
      else
        [slug, '-', max_i[slug]+=1].join
      end
    end
  end

  def regex
    /\A[A-Za-z0-9_]+(?:-[A-Za-z0-9_]+)*\z/
  end

  def slugify str
    str.parameterize
  end

end