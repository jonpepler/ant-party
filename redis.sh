container_name=ant-party-redis

# stop redis docker on exit
function cleanup()
{
  echo "cleaning up..."
  echo "docker stop $(docker stop $container_name)"
  echo "docker rm $(docker rm $container_name)"
  exit 0
}
trap cleanup EXIT

echo "Starting $container_name..."
docker run --name $container_name -p 6379:6379 -d redis
container_id=$(docker ps -aqf "name=${container_name}")

read -n 1 -s -r -p "Press any key to stop"
