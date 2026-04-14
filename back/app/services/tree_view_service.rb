# frozen_string_literal: true

# Used to generate a three-level grouped view:
# - Spaces (with folders and projects as children)
# - Folders (with projects as children)
# - Projects
class TreeViewService
  def generate_tree
    # Add all spaces with their children
    tree = spaces.map do |space|
      build_space_node(space)
    end

    # Add root-level folders (not in any space)
    root_folders.each do |folder|
      tree << build_folder_node(folder)
    end

    # Add root-level projects (not in any space or folder)
    root_projects.each do |project|
      tree << build_project_node(project)
    end

    tree
  end

  private

  def spaces
    Space.all
  end

  def folders_in_space(space_id)
    # Folders in this space (admin_publications are already at root level for folders)
    ProjectFolders::Folder
      .joins(:admin_publication)
      .where(space_id: space_id)
      .where(admin_publications: { parent_id: nil })
  end

  def projects_in_space(space_id)
    # Projects in this space but not in a folder (no parent admin_publication)
    Project
      .joins(:admin_publication)
      .where(space_id: space_id)
      .where(admin_publications: { parent_id: nil })
  end

  def root_folders
    folders_in_space(nil) # Folders not in any space
  end

  def root_projects
    projects_in_space(nil) # Projects not in any space or folder
  end

  def projects_in_folder(folder)
    # Projects whose admin_publication has this folder's admin_publication as parent
    Project
      .joins(:admin_publication)
      .where(admin_publications: { parent_id: folder.admin_publication.id })
  end

  def build_space_node(space)
    # Add folders in this space
    children = folders_in_space(space.id).map do |folder|
      build_folder_node(folder)
    end

    # Add projects directly in this space (not in a folder)
    projects_in_space(space.id).each do |project|
      children << build_project_node(project)
    end

    {
      id: space.id,
      type: 'space',
      title_multiloc: space.title_multiloc,
      children: children
    }
  end

  def build_folder_node(folder)
    children = projects_in_folder(folder).map do |project|
      build_project_node(project)
    end

    {
      id: folder.id,
      type: 'folder',
      title_multiloc: folder.title_multiloc,
      children: children
    }
  end

  def build_project_node(project)
    {
      id: project.id,
      type: 'project',
      title_multiloc: project.title_multiloc
    }
  end
end
