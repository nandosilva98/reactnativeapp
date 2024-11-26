import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/cadastro.css'; 

const cadastroAgendamentos = () => {
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);
  const [datasDisponiveis, setDatasDisponiveis] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [dataEscolhida, setDataEscolhida] = useState('');
  const [horaEscolhida, setHoraEscolhida] = useState('');
  const [servicoEscolhido, setServicoEscolhido] = useState('');
  const [valorOrcamento, setValorOrcamento] = useState(0);

  useEffect(() => {
    const carregarServicosDisponiveis = async () => {
      try {
        const response = await axios.get('http://192.168.1.200:3000/api/servicos');
        setServicosDisponiveis(response.data);
      } catch (error) {
        alert('Erro interno do sistema');
      }
    };

    const gerarDatasDisponiveis = () => {
      const hoje = new Date();
      const diasParaMostrar = 14;
      let datas: string[] = [];
      for (let i = 0; i < diasParaMostrar; i++) {
        hoje.setDate(hoje.getDate() + 1);
        const diaSemana = hoje.getDay();
        if (diaSemana === 0 || diaSemana === 6) continue;

        const dia = String(hoje.getDate()).padStart(2, '0');
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const ano = hoje.getFullYear();
        const dataFormatada = `${ano}-${mes}-${dia}`;
        datas.push(dataFormatada);
      }
      setDatasDisponiveis(datas);
    };

    carregarServicosDisponiveis();
    gerarDatasDisponiveis();
  }, []);

  useEffect(() => {
    const consultarHorariosDisponiveis = async () => {
      if (!dataEscolhida) return;
      try {
        const responseClientes = await axios.get('http://192.168.1.200:3000/api/clientes');
        const horariosOcupados = responseClientes.data
          .filter((item: any) => item.data === dataEscolhida)
          .map((item: any) => item.hora);

        const responseGestao = await axios.get('http://192.168.1.200:3000/api/gestao');
        const todosHorarios = responseGestao.data;
        const horariosDisponiveis = todosHorarios.filter((hora: string) => !horariosOcupados.includes(hora));
        setHorariosDisponiveis(horariosDisponiveis);
      } catch (error) {
        alert('Erro interno do sistema.');
      }
    };

    consultarHorariosDisponiveis();
  }, [dataEscolhida]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataEscolhida || !horaEscolhida) {
      alert('Por favor, selecione uma data e um horário antes de cadastrar.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.200:3000/api/cadastro', {
        nomeCliente,
        data: dataEscolhida,
        hora: horaEscolhida,
        servico: servicoEscolhido,
        valorOrcamento
      });

      if (response.status === 201) {
        alert(response.data.message);
        setNomeCliente('');
        setDataEscolhida('');
        setHoraEscolhida('');
        setServicoEscolhido('');
        setValorOrcamento(0);
      }
    } catch (error) {
      alert('Erro ao cadastrar agendamento');
    }
  };

  return (
    <div className="container">
      <h1>Cadastrar Novo Agendamento</h1>
      <form onSubmit={handleFormSubmit}>
        <label htmlFor="nomeCliente">Nome do Cliente:</label>
        <input
          type="text"
          id="nomeCliente"
          value={nomeCliente}
          onChange={(e) => setNomeCliente(e.target.value)}
          required
        />

        <label htmlFor="dataEscolhida">Data:</label>
        <select
          id="dataEscolhida"
          value={dataEscolhida}
          onChange={(e) => setDataEscolhida(e.target.value)}
          required
        >
          <option value="">Selecione uma data</option>
          {datasDisponiveis.map((data) => (
            <option key={data} value={data}>
              {data.split('-').reverse().join('/')}
            </option>
          ))}
        </select>

        <label htmlFor="horaEscolhida">Horário:</label>
        <select
          id="horaEscolhida"
          value={horaEscolhida}
          onChange={(e) => setHoraEscolhida(e.target.value)}
          required
        >
          <option value="">Selecione uma data primeiro</option>
          {horariosDisponiveis.map((hora) => (
            <option key={hora} value={hora}>
              {hora}
            </option>
          ))}
        </select>

        <label htmlFor="servicoEscolhido">Serviço:</label>
        <select
          id="servicoEscolhido"
          value={servicoEscolhido}
          onChange={(e) => {
            const servico = servicosDisponiveis.find((s: any) => s.nome === e.target.value);
            setServicoEscolhido(e.target.value);
            setValorOrcamento(servico ? servico.preco : 0);
          }}
          required
        >
          <option value="">Carregando serviços...</option>
          {servicosDisponiveis.map((servico: any) => (
            <option key={servico.nome} value={servico.nome}>
              {servico.nome} - R$ {servico.preco}
            </option>
          ))}
        </select>

        <button type="submit">Cadastrar Agendamento</button>
      </form>
    </div>
  );
};

export default cadastroAgendamentos;