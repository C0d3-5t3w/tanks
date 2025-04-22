MAIN_PATH=cmd/main/main.go

all: clean go php ts sass run 

clean:
	@rm -rf static/css
	@rm -rf static/js
	@rm -rf tsconfig.json
	@rm -rf package-lock.json
	@rm -rf /pages/*.html
	@rm -rf *.html

go:
	@go mod tidy
	@go mod download
	@go mod vendor
	@go mod verify

php:
	@find . -type f -path "./pages/*.php" | sort
	@find . -type f -path "./*.php" | sort | \
	  xargs -I {} sh -c '\
	    file="{}"; \
	    if [ "$${file##*.}" = "php" ]; then \
	      dir=$$(dirname "$$file"); \
	      html_file="$$dir/$$(basename "$${file%.php}.html")"; \
	      php "$$file" > "$$html_file"; \
	    fi'
	@find . -type f -path "./pages/*.php" -exec sh -c '\
	  for file; do \
	    if [ "$${file##*.}" = "php" ]; then \
	      dir=$$(dirname "$$file"); \
	      html_file="$$dir/$$(basename "$${file%.php}.html")"; \
	      php "$$file" > "$$html_file"; \
	    fi; \
	  done' sh {} +
	@find . -type f -name "*.html" | grep -v "node_modules" | sort

ts:
	@tsc --init
	@tsc --project tsconfig.json --outDir static/js --sourceMap

sass:
	@sass static/sass:static/css --style compressed --update

run:
	@go run ${MAIN_PATH}

help:
	@echo "Available targets:"
	@echo "  all          - Runs all commands below in proper order"
	@echo "  run          - Runs go server with compiled files"
	@echo "  clean        - Remove compiled files"
	@echo "  ts           - Compile TypeScript files into Javascript files"
	@echo "  php          - Compile Php files into Html files"
	@echo "  sass         - Compile Scss files into Css files"
	@echo "  go           - Get Go packages"
	@echo "  help         - This help message"

.PHONY: all clean go php ts sass run help

# <3
