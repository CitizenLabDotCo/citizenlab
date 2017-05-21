class XlsxService

  include HtmlToPlainText

  @@multiloc_service = MultilocService.new

  def header_style s
    s.add_style  :bg_color => "99ccff", :fg_color => "2626ff", :sz => 16, :alignment => { :horizontal=> :center }
  end

  def generate_users_xlsx users
    pa = Axlsx::Package.new
    wb = pa.workbook
    wb.styles do |s|
      wb.add_worksheet(:name => "Users") do |sheet|
        sheet.add_row ["id","email","first_name","last_name","slug","gender","birthyear","created_at"], style: header_style(s)
        users.each do |user|
          sheet.add_row [user.id, user.email, user.first_name, user.last_name, user.slug, user.gender, user.birthyear, user.created_at]
        end
      end
    end
    pa.to_stream
  end

  def generate_ideas_xlsx ideas
    pa = Axlsx::Package.new
    wb = pa.workbook
    wb.styles do |s|
      wb.add_worksheet(name: "Ideas") do |sheet|
        sheet.add_row [
          "id",
          "title",
          "body",
          "author_name",
          "author_email",
          "publication_status",
          "published_at",
          "upvotes_count",
          "downvotes_count",
          "project",
          "topics",
          "areas"
        ], style: header_style(s)
        ideas.each do |idea|
          sheet.add_row [
            idea.id,
            @@multiloc_service.t(idea.title_multiloc),
            convert_to_text(@@multiloc_service.t(idea.body_multiloc)),
            idea.author_name,
            idea.author.email,
            idea.publication_status,
            idea.published_at,
            idea.upvotes_count,
            idea.downvotes_count,
            @@multiloc_service.t(idea.project.title_multiloc),
            idea.topics.map{|t| @@multiloc_service.t(t.title_multiloc)}.join(','),
            idea.areas.map{|a| @@multiloc_service.t(a.title_multiloc)}.join(',')
          ]
        end
        sheet.column_info[2].width = 65
      end
    end
    pa.to_stream
  end

  def generate_comments_xlsx comments
    pa = Axlsx::Package.new
    wb = pa.workbook
    wb.styles do |s|
      wb.add_worksheet(name: "Ideas") do |sheet|
        sheet.add_row [
          "id",
          "body",
          "idea",
          "author_name",
          "author_email",
          "created_at",
          "parent",
          "project",
        ], style: header_style(s)
        comments.each do |comment|
          sheet.add_row [
            comment.id,
            convert_to_text(@@multiloc_service.t(comment.body_multiloc)),
            @@multiloc_service.t(comment.idea.title_multiloc),
            comment.author_name,
            comment.author.email,
            comment.created_at,
            comment.parent_id,
            @@multiloc_service.t(comment.idea.project&.title_multiloc)
          ]
        end
        sheet.column_info[1].width = 65
      end
    end
    pa.to_stream
  end

end