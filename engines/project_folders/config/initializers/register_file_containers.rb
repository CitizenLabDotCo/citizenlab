
ProjectFolders::Engine::config.to_prepare do

  ::WebApi::V1::FilesController.register_container(
      'ProjectFolder',
      ProjectFolders::Folder,
      ProjectFolders::File,
      ProjectFolders::FilePolicy::Scope,
      :files,
      :project_folder_id
  )

  ::WebApi::V1::ImagesController.register_container(
      'ProjectFolder',
      ProjectFolders::Folder,
      ProjectFolders::Image,
      ProjectFolders::ImagePolicy::Scope,
      :images,
      :project_folder_id
  )

end