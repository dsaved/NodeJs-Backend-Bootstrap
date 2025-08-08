install:
	yarn --cwd api install
	yarn --cwd email-service install

add:
	yarn --cwd api add ${name}

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
	yarn --cwd api migration:run

db-migrate-revert:
	yarn --cwd api migration:revert

db-migrate-reset:
	yarn --cwd api migration:reset

db-migrate-down:
	yarn --cwd api migration:down

db-migrate-drop:
	yarn --cwd api migration:drop

db-migrate-sync:
	yarn --cwd api migration:sync

db-seeder-run:
	yarn --cwd api seed:run