CREATE TABLE schedules (
    id              BIGSERIAL PRIMARY KEY,
    station_id      TEXT        NOT NULL,
    line_id         TEXT        NOT NULL,
    thread_uid      TEXT        NOT NULL,
    train_number    TEXT        NOT NULL,
    train_type      TEXT        NOT NULL,
    origin          TEXT        NOT NULL,
    destination     TEXT        NOT NULL,
    direction       TEXT        NOT NULL,
    departure       TIME        NOT NULL,
    arrival         TIME,
    days_mask       SMALLINT    NOT NULL,
    platform        TEXT,
    track           TEXT,
    fetched_at      TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT schedules_uq UNIQUE (station_id, thread_uid, departure)
);

CREATE INDEX idx_sched_station_time ON schedules (station_id, departure);
CREATE INDEX idx_sched_line         ON schedules (line_id);

CREATE TABLE api_usage (
    day         DATE        PRIMARY KEY,
    requests    INT         NOT NULL DEFAULT 0
);
