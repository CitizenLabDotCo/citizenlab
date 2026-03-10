# Used to generate a grouped view, with top-level admin publication
# in an array, and folders having an array of children
# (see specs)
class TreeViewService
  def initialize(space_id: nil)
    @space_id = space_id
  end

  def generate_tree
    roots = fetch_root_publications
    roots.map { |root| build_tree_node(root) }
  end

  private

  def fetch_root_publications
    query = AdminPublication
      .where(parent_id: nil)
      .order(:lft)

    query = filter_by_space(query) if @space_id.present?

    query.includes(:publication, children: :publication)
  end

  def filter_by_space(query)
    query.joins(<<-SQL.squish)
      LEFT JOIN projects ON admin_publications.publication_type = 'Project' 
                         AND admin_publications.publication_id = projects.id
      LEFT JOIN project_folders_folders ON admin_publications.publication_type = 'ProjectFolders::Folder' 
                                        AND admin_publications.publication_id = project_folders_folders.id
    SQL
      .where('projects.space_id = ? OR project_folders_folders.space_id = ?', @space_id, @space_id)
  end

  def build_tree_node(admin_publication)
    publication = admin_publication.publication

    node = {
      id: publication.id,
      type: publication_type_name(admin_publication.publication_type),
      title_multiloc: publication.title_multiloc
    }

    node[:children] = build_children(admin_publication.children) if folder?(admin_publication)

    node
  end

  def build_children(children)
    filtered_children = filter_children_by_space(children)

    filtered_children.map do |child|
      {
        id: child.publication_id,
        type: 'project',
        title_multiloc: child.publication.title_multiloc
      }
    end
  end

  def filter_children_by_space(children)
    return children if @space_id.blank?

    children.select do |child|
      child.publication.is_a?(Project) && child.publication.space_id == @space_id
    end
  end

  def folder?(admin_publication)
    admin_publication.publication_type == 'ProjectFolders::Folder'
  end

  def publication_type_name(type)
    type == 'ProjectFolders::Folder' ? 'folder' : 'project'
  end
end
