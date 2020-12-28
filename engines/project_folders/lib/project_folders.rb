require 'project_folders/engine'

module ProjectFolders
  # Your code goes here...
  extend ActiveSupport::Autoload

  autoload :MonkeyPatches, 'project_folders/monkey_patches'
end
