const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/gestao', (req, res) => {
    const query = "SELECT hora FROM gestao";

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Erro ao buscar dados da gestão.' });
        }

        const horarios = rows.map(row => row.hora);
        res.json(horarios);
    });
});

app.get('/api/clientes', (req, res) => {
    db.all('SELECT * FROM clientes', [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar dados:', err.message);
            return res.status(500).json({ message: 'Erro ao consultar orçamentos' });
        }

        res.json(rows);
    });
});

app.get('/api/servicos', (req, res) => {
    const sql = 'SELECT nome, preco FROM servicos';

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar informações de servicos', err.message);
            return res.status(500).json({ message: 'Erro ao obter os dados de serviços' });
        }

        res.json(rows);
    });
});

app.post('/api/cadastro', (req, res) => {
    const { nomeCliente, data, hora, servico, valorOrcamento } = req.body;

    if (!nomeCliente || !data || !hora || !servico || !valorOrcamento) {
        return res.status(400).json({ message: 'Todos os campos devem ser preenchidos.' });
    }

    const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
    const horaRegex = /^\d{2}:\d{2}:\d{2}$/;

    if (!dataRegex.test(data) || !horaRegex.test(hora)) {
        return res.status(400).json({ message: 'Formato de data ou hora inválido.' });
    }

    const sqlInsert = 'INSERT INTO clientes (nome_cliente, data, hora, servico, valor_orcamento) VALUES (?, ?, ?, ?, ?)';

    db.run(sqlInsert, [nomeCliente, data, hora, servico, valorOrcamento], function(err) {
        if (err) {
            console.error('Erro ao inserir orçamento', err.message);
            return res.status(500).json({ message: 'Erro ao salvar o orçamento' });
        }

        res.status(201).json({ message: 'Orçamento cadastrado com sucesso' });
    });
});


app.put('/api/agendamentos/:id', (req, res) => {
    const { id } = req.params;
    const { nome_cliente, servico, valor_orcamento } = req.body;

    const sql = `UPDATE clientes 
                 SET nome_cliente = ?, servico = ?, valor_orcamento = ?
                 WHERE id = ?`;

    db.run(sql, [nome_cliente, servico, valor_orcamento, id], function(err) {
        if (err) {
            console.error('Erro ao atualizar o agendamento:', err.message);
            return res.status(500).json({ message: 'Erro ao atualizar agendamento.' });
        }
        res.json({ message: 'Agendamento atualizado com sucesso!' });
    });
});

app.delete('/api/agendamentos/:id', (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM clientes WHERE id = ?`;
    db.run(sql, [id], function(err) {
        if (err) {
            console.error('Erro ao excluir agendamento:', err.message);
            return res.status(500).json({ message: 'Erro ao excluir o agendamento.' });
        }
        res.json({ message: 'Agendamento excluído com sucesso!' });
    });
});


async function arquivarAgendamentosConcluidos() {
    try {
        const dataAtual = new Date();

        const doisDiasAtras = new Date(dataAtual);
        doisDiasAtras.setDate(dataAtual.getDate() - 2);

        const dataFormatada = doisDiasAtras.toISOString().split('T')[0];

        db.all(`SELECT * FROM clientes WHERE data <= ?`, [dataFormatada], (err, agendamentos) => {
            if (err) {
                console.error('Erro ao buscar agendamentos: ', err);
                return;
            }

            agendamentos.forEach(agendamento => {
                db.run(`INSERT INTO concluidos (nome_cliente, data, hora, servico, valor_orcamento, concluido_em)
                        VALUES (?, ?, ?, ?, ?, ?)`, [
                            agendamento.nome_cliente,
                            agendamento.data,
                            agendamento.hora,
                            agendamento.servico,
                            agendamento.valor_orcamento,
                            new Date().toISOString()
                        ], function(err) {
                            if (err) {
                                console.error('Erro ao arquivar agendamento: ', err);
                            } else {
                                db.run(`DELETE FROM clientes WHERE id = ?`, [agendamento.id], (err) => {
                                    if (err) {
                                        console.error('Erro ao excluir agendamento da tabela cliente: ', err);
                                    } else {
                                        console.log(`agendamento com ID ${agendamento.id} movido para concluidos.`);
                                    }
                                });
                            }
                        });
            });
        });

    } catch (error) {
        console.error('Erro ao arquivar agendamentos: ', error);
    }
}

setInterval(arquivarAgendamentosConcluidos, 24 * 60 * 60 * 1000); // 24 Horas
arquivarAgendamentosConcluidos();


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor ONLINE`);
});