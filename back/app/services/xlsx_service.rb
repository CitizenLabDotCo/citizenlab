# frozen_string_literal: true

class XlsxService
  include HtmlToPlainText

  def multiloc_service
    MultilocService.new
  end

  def escape_formula(text)
    # After https://docs.servicenow.com/bundle/orlando-platform-administration/page/administer/security/reference/escape-excel-formula.html and http://rorsecurity.info/portfolio/excel-injection-via-rails-downloads
    if '=+-@'.include?(text.first) && !text.empty?
      "'#{text}"
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
  def hash_array_to_xlsx(hash_array)
    headers = hash_array.flat_map(&:keys).uniq

    pa = Axlsx::Package.new
    wb = pa.workbook

    wb.styles do |s|
      wb.add_worksheet do |sheet|
        sheet.add_row headers, style: header_style(s)
        hash_array.each do |hash|
          sheet.add_row headers.map { |header| hash[header] }
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
  def xlsx_to_hash_array(xlsx)
    workbook = RubyXL::Parser.parse_buffer(xlsx)
    worksheet = workbook.worksheets[0]
    worksheet.drop(1).map do |row|
      (row&.cells || []).compact.map do |cell|
        [worksheet[0][cell.column]&.value, cell.value] if cell.value
      end.compact.to_h
    end.compact
  end

  def generate_xlsx(sheetname, columns, instances)
    columns = columns.uniq { |c| c[:header] }
    pa = Axlsx::Package.new
    generate_sheet pa.workbook, sheetname, columns, instances
    pa.to_stream
  end

  def generate_sheet(workbook, sheetname, columns, instances)
    columns = columns.uniq { |c| c[:header] }
    workbook.styles do |s|
      workbook.add_worksheet(name: sheetname) do |sheet|
        header = columns.pluck(:header)
        column_widths = columns.pluck(:width)
        sheet.column_widths *column_widths
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

  def generate_time_stats_xlsx(serie, name)
    columns = [
      { header: 'date',   f: ->(item) { item[0] } },
      { header: 'amount', f: ->(item) { item[1] } }
    ]
    generate_xlsx name, columns, serie
  end

  def generate_field_stats_xlsx(serie, key_name, value_name)
    columns = [
      { header: key_name,   f: ->(item) { item[0] } },
      { header: value_name, f: ->(item) { item[1] } }
    ]
    generate_xlsx "#{value_name}_by_#{key_name}", columns, serie
  end

  def generate_res_stats_xlsx(serie, resource_name, grouped_by)
    grouped_by_id = "#{grouped_by}_id"
    columns = [
      { header: grouped_by,    f: ->(item) { item[grouped_by] } },
      { header: grouped_by_id, f: ->(item) { item[grouped_by_id] } },
      { header: resource_name, f: ->(item) { item[resource_name] } }
    ]
    generate_xlsx "#{resource_name}_by_#{grouped_by}", columns, serie
  end

  def generate_votes_by_time_xlsx(serie, name)
    columns = [
      { header: 'date',  f: ->(item) { item['date'] } },
      { header: 'up',    f: ->(item) { item['up'] } },
      { header: 'down',  f: ->(item) { item['down'] } },
      { header: 'total', f: ->(item) { item['total'] } }
    ]
    generate_xlsx name, columns, serie
  end

  def generate_users_xlsx(users, view_private_attributes: false)
    columns = [
      { header: 'id', f: ->(u) { u.id }, skip_sanitization: true },
      { header: 'email', f: ->(u) { u.email } },
      { header: 'first_name', f: ->(u) { u.first_name } },
      { header: 'last_name', f: ->(u) { u.last_name } },
      { header: 'profile_page', f: ->(u) { Frontend::UrlService.new.model_to_url(u) }, skip_sanitization: true },
      { header: 'created_at', f: ->(u) { u.created_at }, skip_sanitization: true },
      *custom_field_columns(:itself, true)
    ]

    unless view_private_attributes
      private_attrs = private_attributes
      columns.reject! { |c| private_attrs.include?(c[:header]) }
    end

    generate_xlsx 'Users', columns, users
  end

  # extended by engines (ie tagging) to implement ideas with additional attributes
  def generate_idea_xlsx_columns(ideas, view_private_attributes: false, with_tags: false)
    columns = [
      { header: 'id',                   f: ->(i) { i.id }, skip_sanitization: true },
      { header: 'title',                f: ->(i) { multiloc_service.t(i.title_multiloc) } },
      { header: 'description',          f: ->(i) { convert_to_text_long_lines(multiloc_service.t(i.body_multiloc)) },                               width: 10 },
      { header: 'author_name',          f: ->(i) { i.author_name } },
      { header: 'author_email',         f: ->(i) { i.author&.email } },
      { header: 'author_id',            f: ->(i) { i.author_id } },
      { header: 'proposed_budget',      f: ->(i) { i.proposed_budget },                                                    skip_sanitization: true },
      { header: 'published_at',         f: ->(i) { i.published_at },                                                       skip_sanitization: true },
      { header: 'comments',             f: ->(i) { i.comments_count },                                                     skip_sanitization: true },
      { header: 'upvotes',              f: ->(i) { i.upvotes_count },                                                      skip_sanitization: true },
      { header: 'downvotes',            f: ->(i) { i.downvotes_count },                                                    skip_sanitization: true },
      { header: 'baskets',              f: ->(i) { i.baskets_count },                                                      skip_sanitization: true },
      { header: 'url',                  f: ->(i) { Frontend::UrlService.new.model_to_url(i) },                             skip_sanitization: true },
      { header: 'project',              f: ->(i) { multiloc_service.t(i&.project&.title_multiloc) } },
      { header: 'topics',               f: ->(i) { i.topics.map { |t| multiloc_service.t(t.title_multiloc) }.join(',') } },
      { header: 'status',               f: ->(i) { multiloc_service.t(i&.idea_status&.title_multiloc) } },
      { header: 'assignee',             f: ->(i) { i.assignee&.full_name } },
      { header: 'assignee_email',       f: ->(i) { i.assignee&.email } },
      { header: 'latitude',             f: ->(i) { i.location_point&.coordinates&.last },                                  skip_sanitization: true },
      { header: 'longitude',            f: ->(i) { i.location_point&.coordinates&.first },                                 skip_sanitization: true },
      { header: 'location_description', f: ->(i) { i.location_description } },
      { header: 'attachments',          f: ->(i) { i.idea_files.map { |f| f.file.url }.join("\n") },                       skip_sanitization: true, width: 2 }
    ]
    columns.concat custom_field_columns :author, view_private_attributes
    columns.reject! { |c| %w[author_email assignee_email author_id].include?(c[:header]) } unless view_private_attributes
    columns
  end

  def generate_ideas_xlsx(ideas, view_private_attributes: false, with_tags: false)
    columns = generate_idea_xlsx_columns(ideas, view_private_attributes: view_private_attributes, with_tags: with_tags)

    generate_xlsx 'Ideas', columns, ideas
  end

  def generate_initiatives_xlsx(initiatives, view_private_attributes: false)
    columns = [
      { header: 'id',                   f: ->(i) { i.id }, skip_sanitization: true },
      { header: 'title',                f: ->(i) { multiloc_service.t(i.title_multiloc) } },
      { header: 'description',          f: ->(i) { convert_to_text_long_lines(multiloc_service.t(i.body_multiloc)) }, width: 10 },
      { header: 'author_name',          f: ->(i) { i.author_name } },
      { header: 'author_email',         f: ->(i) { i.author&.email } },
      { header: 'author_id',            f: ->(i) { i.author_id } },
      { header: 'published_at',         f: ->(i) { i.published_at },                                    skip_sanitization: true },
      { header: 'comments',             f: ->(i) { i.comments_count },                                  skip_sanitization: true },
      { header: 'upvotes',              f: ->(i) { i.upvotes_count },                                   skip_sanitization: true },
      { header: 'url',                  f: ->(i) { Frontend::UrlService.new.model_to_url(i) },          skip_sanitization: true },
      { header: 'topics',               f: ->(i) { i.topics.map { |t| multiloc_service.t(t.title_multiloc) }.join(',') } },
      { header: 'initiative_status',    f: ->(i) { multiloc_service.t(i&.initiative_status&.title_multiloc) } },
      { header: 'assignee',             f: ->(i) { i.assignee&.full_name } },
      { header: 'assignee_email',       f: ->(i) { i.assignee&.email } },
      { header: 'latitude',             f: ->(i) { i.location_point&.coordinates&.last },               skip_sanitization: true },
      { header: 'longitude',            f: ->(i) { i.location_point&.coordinates&.first },              skip_sanitization: true },
      { header: 'location_description', f: ->(i) { i.location_description } },
      { header: 'attachmens',           f: ->(i) { i.initiative_files.map { |f| f.file.url }.join("\n") }, skip_sanitization: true, width: 2 }
    ]
    columns.concat custom_field_columns :author, view_private_attributes
    columns.reject! { |c| %w[author_email assignee_email author_id].include?(c[:header]) } unless view_private_attributes
    generate_xlsx 'Initiatives', columns, initiatives
  end

  def generate_idea_comments_xlsx(comments, view_private_attributes: false)
    columns = [
      { header: 'id',                 f: ->(c) { c.id }, skip_sanitization: true },
      { header: 'input',              f: ->(c) { multiloc_service.t(c.post.title_multiloc) } },
      { header: 'input_id',           f: ->(c) { c.post.id } },
      { header: 'comment',            f: ->(c) { convert_to_text_long_lines(multiloc_service.t(c.body_multiloc)) }, width: 10  },
      { header: 'upvotes_count',      f: ->(c) { c.upvotes_count }, skip_sanitization: true },
      { header: 'author_name',        f: ->(c) { c.author_name } },
      { header: 'author_email',       f: ->(c) { c.author&.email } },
      { header: 'author_id',          f: ->(i) { i.author_id } },
      { header: 'created_at',         f: ->(c) { c.created_at },    skip_sanitization: true },
      { header: 'parent_comment_id',  f: ->(c) { c.parent_id },     skip_sanitization: true },
      { header: 'project',            f: ->(c) { multiloc_service.t(c&.idea&.project&.title_multiloc) } }
    ]
    columns.concat custom_field_columns :author, view_private_attributes
    columns.reject! { |c| %w[author_email author_id].include?(c[:header]) } unless view_private_attributes
    generate_xlsx 'Comments', columns, comments
  end

  def generate_initiative_comments_xlsx(comments, view_private_attributes: false)
    columns = [
      { header: 'id',            f: ->(c) { c.id }, skip_sanitization: true },
      { header: 'proposal',    f: ->(c) { multiloc_service.t(c.post.title_multiloc) } },
      { header: 'proposal_id',         f: ->(c) { c.post.id } },
      { header: 'comment',          f: ->(c) { convert_to_text_long_lines(multiloc_service.t(c.body_multiloc)) }, width: 10  },
      { header: 'upvotes_count', f: ->(c) { c.upvotes_count }, skip_sanitization: true },
      { header: 'author_name',   f: ->(c) { c.author_name } },
      { header: 'author_email',  f: ->(c) { c.author&.email } },
      { header: 'author_id',            f: ->(i) { i.author_id } },
      { header: 'created_at',    f: ->(c) { c.created_at },    skip_sanitization: true },
      { header: 'parent_comment_id',        f: ->(c) { c.parent_id },     skip_sanitization: true }
    ]
    columns.concat custom_field_columns :author, view_private_attributes
    columns.reject! { |c| %w[author_email author_id].include?(c[:header]) } unless view_private_attributes
    generate_xlsx 'Comments', columns, comments
  end

  def generate_invites_xlsx(invites, view_private_attributes: false)
    columns = [
      { header: 'token',         f: ->(i) { i.token },                 skip_sanitization: true },
      { header: 'invite_status', f: ->(i) { i.invitee.invite_status }, skip_sanitization: true },
      { header: 'email',         f: ->(i) { i.invitee.email } },
      { header: 'first_name',    f: ->(i) { i.invitee.first_name } },
      { header: 'last_name',     f: ->(i) { i.invitee.last_name } },
      { header: 'locale',        f: ->(i) { i.invitee.locale }, skip_sanitization: true },
      { header: 'groups',        f: ->(i) { i.invitee.manual_groups.map { |g| multiloc_service.t(g.title_multiloc) }.join(',') }, skip_sanitization: true },
      { header: 'admin',         f: ->(i) { i.invitee.admin? }, skip_sanitization: true }
    ]
    columns.reject! { |c| c[:header] == 'email' } unless view_private_attributes
    generate_xlsx 'Invites', columns, invites
  end

  # @param [Symbol] record_to_user
  # @param [Boolean] view_private_attributes
  def custom_field_columns(record_to_user, view_private_attributes)
    return [] unless view_private_attributes

    areas = Area.all.index_by(&:id)
    user_custom_fields = CustomField.with_resource_type('User').enabled.order(:ordering)

    user_custom_fields&.map do |field|

      column_name = multiloc_service.t(field.title_multiloc)
      value_getter = # lambda that gets a record and returns the field value
        if field.key == 'domicile'  # 'domicile' is a special case
          lambda do |record|
            user = record.send(record_to_user)
            multiloc_service.t(areas[user.domicile]&.title_multiloc) if user && user.custom_field_values['domicile']
          end
        else # all other custom fields
          lambda do |record|
            user = record.send(record_to_user)
            user && user.custom_field_values[field.key]
          end
        end

      { header: column_name, f: value_getter }
    end
  end

  private

  def private_attributes
    custom_field_attrs = CustomField.with_resource_type('User')&.map do |field|
      multiloc_service.t(field.title_multiloc)
    end
    custom_field_attrs + %w[email gender birthyear domicile education Email author_email author_id assignee_email]
  end

  def header_style(s)
    s.add_style bg_color: '99ccff', fg_color: '2626ff', sz: 16, alignment: { horizontal: :center }
  end

  def convert_to_text_long_lines html
    convert_to_text(html).gsub(/\n/, ' ')
  end
end

XlsxService.prepend_if_ee('Verification::Patches::XlsxService')
XlsxService.prepend_if_ee('Tagging::Patches::XlsxService')
