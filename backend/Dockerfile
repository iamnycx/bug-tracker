FROM python:3.14-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy uv binary from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install dependencies (cached layer)
COPY pyproject.toml uv.lock* ./
RUN uv sync --frozen --no-dev

COPY . .

# --- dev stage ---
FROM base AS dev
RUN uv sync --frozen
CMD ["uv", "run", "flask", "--app", "run", "run", "--host", "0.0.0.0", "--port", "5000", "--debug"]

# --- prod stage ---
FROM base AS prod
RUN uv add granian
CMD ["sh", "-c", "uv run flask --app run db upgrade && exec uv run granian --interface wsgi run:app --host 0.0.0.0 --port 8000"]
