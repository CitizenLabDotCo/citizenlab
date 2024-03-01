# How to update the gemfile-que-1 gemfile
1. Replicate the changes you made in the main `Gemfile` to `gemfile-que-1/Gemfile`.
2. Run the following command to update the `gemfile-que-1/Gemfile.lock`:
    ```bash
    docker-compose run --rm -it que-1 bash -c "bundle config set frozen false && bundle install"
    ```