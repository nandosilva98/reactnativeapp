CREATE DATABASE IF NOT EXISTS "database";

CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_cliente TEXT NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    servico TEXT NOT NULL,
    valor_orcamento REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS concluidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_cliente TEXT NOT NULL,
    data TEXT NOT NULL,
    hora TEXT NOT NULL,
    servico TEXT NOT NULL,
    valor_orcamento REAL NOT NULL,
    concluido_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gestao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hora TIME NOT NULL
);

CREATE TABLE IF NOT EXISTS servicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco REAL NOT NULL
);