
TESTS = test/*.test.js

SRC = $(shell find lib -type f)

test:
	@./deps/expresso/bin/expresso \
		--serial \
		--timeout 5000 \
		-I support \
		-I support/jsdom/lib \
		-I support/htmlparser/lib \
		-I lib \
		$(TEST_FLAGS) \
		$(TESTS)

test-cov:
	@$(MAKE) TEST_FLAGS=--cov

.PHONY: test test-cov