CREATE TABLE groups (
        id TEXT PRIMARY KEY,
        Nombre TEXT,
        Baneados TEXT DEFAULT '[{"Juegos": [], "Personas": []}]',
        modo_admin INTEGER DEFAULT 0,
        bot INTEGER DEFAULT 0,
        bot_asignado TEXT DEFAULT '',
        welcome INTEGER DEFAULT 0
    );
CREATE TABLE bots (
        numero TEXT PRIMARY KEY,
        Nombre TEXT,
        cargo TEXT
    );
CREATE TABLE quest (
        id_group TEXT PRIMARY KEY,
        activeQuest INTEGER DEFAULT 0,
        correctAnswer TEXT,
        title_quest TEXT,
        index_p INTEGER DEFAULT 0
    );
CREATE TABLE anime (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        genre TEXT,
        year TEXT
    );
CREATE TABLE sqlite_sequence(name,seq);

CREATE TABLE matrimonio (
    id TEXT PRIMARY KEY,
    pareja TEXT DEFAULT 'nadie :(',
    FOREIGN KEY (id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE TABLE players (
    id TEXT PRIMARY KEY,
    nombre TEXT,
    dias INTEGER DEFAULT 0,
    Banco INTEGER DEFAULT 0,
    Dinero INTEGER DEFAULT 0,
    Nivel INTEGER DEFAULT 0,
    Mensajes INTEGER DEFAULT 0,
    Puntos INTEGER DEFAULT 0,
    cumpleanos DATETIME DEFAULT 'indefinido',
    sexo TEXT DEFAULT 'Hombre',
    Rool TEXT DEFAULT 'vagabundo',
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE hijos (
    id_matrimonio TEXT,
    id_hijo TEXT,
    nombre_hijo TEXT,
    fecha_nacimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_matrimonio, id_hijo),
    FOREIGN KEY (id_matrimonio) REFERENCES matrimonio(id) ON DELETE CASCADE,
    FOREIGN KEY (id_hijo) REFERENCES players(id) ON DELETE CASCADE
);
CREATE TABLE MensajesGrupoJugadores(
    id_group TEXT,
    id_player TEXT,
    mensajes INTEGER DEFAULT 0,
    fechayhora DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_group, id_player),
    FOREIGN KEY (id_group) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (id_player) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS players_create_matrimonio
AFTER INSERT ON players
BEGIN
    INSERT OR IGNORE INTO matrimonio(id) VALUES (NEW.id);
END;

