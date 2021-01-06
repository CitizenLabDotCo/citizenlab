class XlsxService

  include HtmlToPlainText

  @@multiloc_service = MultilocService.new


  def escape_formula text
    # After https://docs.servicenow.com/bundle/orlando-platform-administration/page/administer/security/reference/escape-excel-formula.html and http://rorsecurity.info/portfolio/excel-injection-via-rails-downloads
    if '=+-@'.include?(text.first) && !text.empty?
      text = "'"+text
    else
      text
    end
  end

  # Converts this hash array:
  #   [{'name' => 'Ron', 'size' => 'xl'), {'name' => 'John', 'age' => 35}]
  # into this xlsx:
  # | name  | size | age |
  # | Ron   | xl   |     |
  # | John  |      | 35  |
  def hash_array_to_xlsx hash_array
    headers = hash_array.flat_map{|hash| hash.keys}.uniq

    pa = Axlsx::Package.new
    wb = pa.workbook

    wb.styles do |s|
      wb.add_worksheet do |sheet|
        sheet.add_row headers, style: header_style(s)
        hash_array.each do |hash|
          sheet.add_row headers.map{|header| hash[header]}
        end
      end
    end

    pa.to_stream
  end

  # Converts this xlsx:
  # | name  | size | age |
  # | Ron   | xl   |     |
  # | John  |      | 35  |
  # into this hash array:
  #   [{'name' => 'Ron', 'size' => 'xl'), {'name' => 'John', 'age' => 35}]
  def xlsx_to_hash_array xlsx
    workbook = RubyXL::Parser.parse_buffer(xlsx)
    worksheet = workbook.worksheets[0]
    worksheet.drop(1).map do |row|
      (row&.cells || []).compact.map do |cell|
        [worksheet[0][cell.column]&.value, cell.value] if cell.value
      end.compact.to_h
    end.compact
  end

  def generate_xlsx sheetname, columns, instances
    columns = columns.uniq{ |c| c[:header] }
    pa = Axlsx::Package.new
    generate_sheet pa.workbook, sheetname, columns, instances
    pa.to_stream
  end

  def generate_sheet workbook, sheetname, columns, instances
    columns = columns.uniq{ |c| c[:header] }
    workbook.styles do |s|
      workbook.add_worksheet(name: sheetname) do |sheet|
        header = columns.map{|c| c[:header]}
        sheet.add_row header, style: header_style(s)
        instances.each do |instance|
          row = columns.map do |c|
            value = c[:f].call instance
            if c[:skip_sanitization]
              value
            else
              escape_formula value.to_s
            end
          end
          sheet.add_row row
        end
      end
    end
  end

  def generate_time_stats_xlsx serie, name
    columns = [
      {header: 'date',   f: -> (item) {item[0]}},
      {header: 'amount', f: -> (item) {item[1]}}
    ]
    generate_xlsx name, columns, serie
  end
  def generate_field_stats_xlsx serie, key_name, value_name
    columns = [
      {header: key_name,   f: -> (item) {item[0]}},
      {header: value_name, f: -> (item) {item[1]}}
    ]
    generate_xlsx value_name + '_by_' + key_name, columns, serie
  end

  def generate_res_stats_xlsx serie, resource_name, grouped_by
    grouped_by_id = "#{grouped_by}_id"
    columns = [
      {header: grouped_by,    f: -> (item) {item[grouped_by]}},
      {header: grouped_by_id,    f: -> (item) {item[grouped_by_id]}},
      {header: resource_name, f: -> (item) {item[resource_name]}}
    ]
    generate_xlsx resource_name + '_by_' + grouped_by, columns, serie
  end

  def generate_votes_by_time_xlsx serie, name
    columns = [
      {header: 'date',  f: -> (item) {item["date"]}},
      {header: 'up',    f: -> (item) {item["up"]}},
      {header: 'down',  f: -> (item) {item["down"]}},
      {header: 'total', f: -> (item) {item["total"]}}
    ]
    generate_xlsx name, columns, serie
  end

  def generate_users_xlsx users, view_private_attributes: false
    areas = Area.all.map{|a| [a.id, a]}.to_h
    custom_field_columns = CustomField.with_resource_type('User')&.map(&:key).map do |key|
      {header: key, f: -> (u) { u.custom_field_values[key] }}
    end
    columns = [
      {header: 'id',         f: -> (u) { u.id },         skip_sanitization: true},
      {header: 'email',      f: -> (u) { u.email }},
      {header: 'first_name', f: -> (u) { u.first_name }},
      {header: 'last_name',  f: -> (u) { u.last_name }},
      {header: 'slug',       f: -> (u) { u.slug },       skip_sanitization: true},
      {header: 'gender',     f: -> (u) { u.gender }},
      {header: 'verified',   f: -> (u) { u.verified },   skip_sanitization: true},
      {header: 'birthyear',  f: -> (u) { u.birthyear }},
      {header: 'domicile',   f: -> (u) { @@multiloc_service.t(areas[u.domicile]&.title_multiloc) }},
      {header: 'education',  f: -> (u) { u.education }},
      {header: 'created_at', f: -> (u) { u.created_at }, skip_sanitization: true},
      *custom_field_columns
    ]
    if !view_private_attributes
      priv_attrs = %w(email gender verified birthyear domicile education)
      priv_attrs += custom_field_columns.map{|c| c[:header]}
      columns.select! do |c|
        !priv_attrs.include?(c[:header])
      end
    end
    generate_xlsx 'Users', columns, users
  end

  def generate_ideas_xlsx ideas, view_private_attributes: false, with_tags: false
    columns = [
      {header: 'id',                   f: -> (i) { i.id },                                        skip_sanitization: true},
      {header: 'title',                f: -> (i) { @@multiloc_service.t(i.title_multiloc) }},
      {header: 'body',                 f: -> (i) { convert_to_text(@@multiloc_service.t(i.body_multiloc)) }},
      {header: 'author_name',          f: -> (i) { i.author_name }},
      {header: 'author_email',         f: -> (i) { i.author&.email }},
      {header: 'proposed_budget',      f: -> (i) { i.proposed_budget },                           skip_sanitization: true},
      {header: 'publication_status',   f: -> (i) { i.publication_status },                        skip_sanitization: true},
      {header: 'published_at',         f: -> (i) { i.published_at },                              skip_sanitization: true},
      {header: 'upvotes_count',        f: -> (i) { i.upvotes_count },                             skip_sanitization: true},
      {header: 'downvotes_count',      f: -> (i) { i.downvotes_count },                           skip_sanitization: true},
      {header: 'baskets_count',        f: -> (i) { i.baskets_count },                             skip_sanitization: true},
      {header: 'url',                  f: -> (i) { Frontend::UrlService.new.model_to_url(i) },    skip_sanitization: true},
      {header: 'project',              f: -> (i) { @@multiloc_service.t(i&.project&.title_multiloc) }},
      {header: 'topics',               f: -> (i) { i.topics.map{|t| @@multiloc_service.t(t.title_multiloc)}.join(',') }},
      {header: 'areas',                f: -> (i) { i.areas.map{|a| @@multiloc_service.t(a.title_multiloc)}.join(',') }},
      {header: 'status',               f: -> (i) { @@multiloc_service.t(i&.idea_status&.title_multiloc) }},
      {header: 'assignee',             f: -> (i) { i.assignee&.full_name }},
      {header: 'assignee_email',       f: -> (i) { i.assignee&.email }},
      {header: 'latitude',             f: -> (i) { i.location_point&.coordinates&.last },         skip_sanitization: true},
      {header: 'longitude',            f: -> (i) { i.location_point&.coordinates&.first },        skip_sanitization: true},
      {header: 'location_description', f: -> (i) { i.location_description }},
      {header: 'comments_count',       f: -> (i) { i.comments_count },                            skip_sanitization: true},
      {header: 'attachments_count',    f: -> (i) { i.idea_files.size },                           skip_sanitization: true},
      {header: 'attachmens',           f: -> (i) { i.idea_files.map{|f| f.file.url}.join("\n") }, skip_sanitization: true}
    ]
    if !view_private_attributes
      columns.select! do |c|
        !%w(author_email assignee_email).include?(c[:header])
      end
    end

    if with_tags
      Tagging::Tag.joins(:taggings).where({tagging_taggings: {idea_id: ideas.map(&:id)}}).each { |tag|
        columns.insert(3,{header: @@multiloc_service.t(tag.title_multiloc), f: -> (i) {
          tagging = Tagging::Tagging.where(tag_id: tag.id, idea_id: i.id)
          !tagging.empty? ? tagging.first.confidence_score : '0'
          }})
      }
    end
    generate_xlsx 'Ideas', columns, ideas
  end

  def generate_initiatives_xlsx initiatives, view_private_attributes: false
    columns = [
      {header: 'id',                   f: -> (i) { i.id },                                              skip_sanitization: true},
      {header: 'title',                f: -> (i) { @@multiloc_service.t(i.title_multiloc) }},
      {header: 'body',                 f: -> (i) { convert_to_text(@@multiloc_service.t(i.body_multiloc)) }},
      {header: 'author_name',          f: -> (i) { i.author_name }},
      {header: 'author_email',         f: -> (i) { i.author&.email }},
      {header: 'publication_status',   f: -> (i) { i.publication_status },                              skip_sanitization: true},
      {header: 'published_at',         f: -> (i) { i.published_at },                                    skip_sanitization: true},
      {header: 'upvotes_count',        f: -> (i) { i.upvotes_count },                                   skip_sanitization: true},
      {header: 'url',                  f: -> (i) { Frontend::UrlService.new.model_to_url(i) },          skip_sanitization: true},
      {header: 'topics',               f: -> (i) { i.topics.map{|t| @@multiloc_service.t(t.title_multiloc)}.join(',') }},
      {header: 'areas',                f: -> (i) { i.areas.map{|a| @@multiloc_service.t(a.title_multiloc)}.join(',') }},
      {header: 'initiative_status',    f: -> (i) { @@multiloc_service.t(i&.initiative_status&.title_multiloc) }},
      {header: 'assignee',             f: -> (i) { i.assignee&.full_name }},
      {header: 'assignee_email',       f: -> (i) { i.assignee&.email }},
      {header: 'latitude',             f: -> (i) { i.location_point&.coordinates&.last },               skip_sanitization: true},
      {header: 'longitude',            f: -> (i) { i.location_point&.coordinates&.first },              skip_sanitization: true},
      {header: 'location_description', f: -> (i) { i.location_description }},
      {header: 'comments_count',       f: -> (i) { i.comments_count },                                  skip_sanitization: true},
      {header: 'attachments_count',    f: -> (i) { i.initiative_files.size },                           skip_sanitization: true},
      {header: 'attachmens',           f: -> (i) { i.initiative_files.map{|f| f.file.url}.join("\n") }, skip_sanitization: true}
    ]
    if !view_private_attributes
      columns.select! do |c|
        !%w(author_email assignee_email).include?(c[:header])
      end
    end
    generate_xlsx 'Initiatives', columns, initiatives
  end

  def generate_idea_comments_xlsx comments, view_private_attributes: false
    columns = [
      {header: 'id',            f: -> (c) { c.id },            skip_sanitization: true},
      {header: 'input',         f: -> (c) { @@multiloc_service.t(c&.post.title_multiloc) }},
      {header: 'body',          f: -> (c) { convert_to_text(@@multiloc_service.t(c.body_multiloc)) }},
      {header: 'upvotes_count', f: -> (c) { c.upvotes_count }, skip_sanitization: true},
      {header: 'author_name',   f: -> (c) { c.author_name }},
      {header: 'author_email',  f: -> (c) { c.author&.email }},
      {header: 'created_at',    f: -> (c) { c.created_at },    skip_sanitization: true},
      {header: 'parent',        f: -> (c) { c.parent_id },     skip_sanitization: true},
      {header: 'project',       f: -> (c) { @@multiloc_service.t(c&.idea&.project&.title_multiloc) }}
    ]
    if !view_private_attributes
      columns.select! do |c|
        !%w(author_email).include?(c[:header])
      end
    end
    generate_xlsx 'Comments', columns, comments
  end

  def generate_initiative_comments_xlsx comments, view_private_attributes: false
    columns = [
      {header: 'id',            f: -> (c) { c.id },            skip_sanitization: true},
      {header: 'initiative',    f: -> (c) { @@multiloc_service.t(c&.post.title_multiloc) }},
      {header: 'body',          f: -> (c) { convert_to_text(@@multiloc_service.t(c.body_multiloc)) }},
      {header: 'upvotes_count', f: -> (c) { c.upvotes_count }, skip_sanitization: true},
      {header: 'author_name',   f: -> (c) { c.author_name }},
      {header: 'author_email',  f: -> (c) { c.author&.email }},
      {header: 'created_at',    f: -> (c) { c.created_at },    skip_sanitization: true},
      {header: 'parent',        f: -> (c) { c.parent_id },     skip_sanitization: true}
    ]
    if !view_private_attributes
      columns.select! do |c|
        !%w(author_email).include?(c[:header])
      end
    end
    generate_xlsx 'Comments', columns, comments
  end

  def generate_invites_xlsx invites, view_private_attributes: false
    columns = [
      {header: 'token',         f: -> (i) { i.token },                 skip_sanitization: true},
      {header: 'invite_status', f: -> (i) { i.invitee.invite_status }, skip_sanitization: true},
      {header: 'email',         f: -> (i) { i.invitee.email }},
      {header: 'first_name',    f: -> (i) { i.invitee.first_name }},
      {header: 'last_name',     f: -> (i) { i.invitee.last_name }},
      {header: 'locale',        f: -> (i) { i.invitee.locale },        skip_sanitization: true},
      {header: 'groups',        f: -> (i) { i.invitee.manual_groups.map{|g| @@multiloc_service.t(g.title_multiloc)}.join(',') }, skip_sanitization: true},
      {header: 'admin',         f: -> (i) { i.invitee.admin? },        skip_sanitization: true}
    ]
    if !view_private_attributes
      columns.select! do |c|
        !%w(email).include?(c[:header])
      end
    end
    generate_xlsx 'Invites', columns, invites
  end


  private

  def header_style s
    s.add_style  :bg_color => "99ccff", :fg_color => "2626ff", :sz => 16, :alignment => { :horizontal=> :center }
  end

end
