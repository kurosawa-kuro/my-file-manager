setup:
	cd src && npm install

dev:
	sh script/kill-port.sh || true
	cd src && npm run dev

build:
	cd src && npm run build

start:
	cd src && npm run start

lint:
	cd src && npm run lint

test:
	cd src && npm run test

test-watch:
	cd src && npm run test:watch

test-coverage:
	cd src && npm run test:coverage

clean:
	cd src && rm -rf .next node_modules/.cache

