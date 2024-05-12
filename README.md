# futsal

A 3v3 multiplayer football like game using websockets, nodejs, and jQuery

## Setup
```
git clone https://github.com/many-fac3d-g0d/futsal.git
```
### Using npm
```
npm install
npm start
```
### Using Docker
Build the docker image using Dockerfile locally
```
docker build -t futsal-local:1.0.0 --build-arg PORT=8000 .
```
Run the docker image
```
docker run -p 8000:8000 -d futsal-local:1.0.0
```

### Using Docker Compose
Start the container
```
docker-compose up -d
```
Stop the container
```
docker-compose down
```

## Live-Demo

![futsal](./client/public/img/game.png)

Play the game with your friends [here](https://futsal.onrender.com)

## ToDo

1. Improve ball & player movement mechanics
2. Improve performance
3. Fix break in iOS safari

## License

This project and its contents are open source under the [MIT License](https://github.com/darekkay/dashboard/blob/master/LICENSE)
