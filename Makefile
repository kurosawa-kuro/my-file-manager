setup:
	cd src && npm install

dev:
	sh script/kill-port.sh || true
	cd src && npm run dev

build:
	cd src && npm run build

test:
	cd src && npm run test

clean:
	cd src && npm run clean

start:
	cd src && npm run start

lint:
	cd src && npm run lint

