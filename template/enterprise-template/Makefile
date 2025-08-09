install:
	yarn --cwd api install
	yarn --cwd email-service install

add:
	yarn --cwd api add ${name}

build:
	yarn --cwd api build

dev-start:
	yarn --cwd api start:dev

check-cycles:
	yarn --cwd api check:cycles 

email-test:
	yarn --cwd email-service test

migration-create:
	yarn --cwd api migration:create src/migrations/${file}

migration-generate:
	yarn --cwd api migration:generate src/migrations/${file}

db-migrate-up:
	cd api && yarn migration:run

db-migrate-revert:
	cd api && yarn migration:undo

db-migrate-reset:
	cd api && yarn migration:undo:all

db-migrate-down:
	cd api && yarn migration:undo

db-migrate-drop:
	cd api && yarn migration:drop

db-migrate-sync:
	cd api && yarn migration:sync

db-seeder-run:
	cd api && yarn seed:run