import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Modal, Button, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Agendamento {
  id: number;
  nome_cliente: string;
  data: string;
  hora: string;
  servico: string;
  valor_orcamento: number;
}

const gerenciamentoAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalExcluirVisible, setModalExcluirVisible] = useState<boolean>(false);
  const [editandoAgendamento, setEditandoAgendamento] = useState<Agendamento | null>(null);
  const [excluirAgendamento, setAgendamentoExcluir] = useState<Agendamento | null>(null);
  const [nomeCliente, setNomeCliente] = useState<string>('');
  const [servico, setServico] = useState<string>('');
  const [valorOrcamento, setValorOrcamento] = useState<string>('');

  useEffect(() => {
    const buscarAgendamentos = async () => {
      try {
        const response = await fetch('http://192.168.1.200:3000/api/clientes');
        if (!response.ok) {
          throw new Error(`Erro na resposta: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setAgendamentos(data);
        } else {
          console.error('Os dados inseridos são invalidos.');
        }
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        Alert.alert('Erro', 'Não foi possível carregar os agendamentos.');
      }
    };
    buscarAgendamentos();
  }, []);

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatarHora = (hora: string) => {
    const [horaFormatada, minuto] = hora.split(':');
    return `${horaFormatada}:${minuto}`;
  };

  const editar = (agendamento: Agendamento) => {
    setEditandoAgendamento(agendamento);
    setNomeCliente(agendamento.nome_cliente);
    setServico(agendamento.servico);
    setValorOrcamento(agendamento.valor_orcamento.toString());
    setModalVisible(true);
  };

  const salvarEdicao = async () => {
    if (editandoAgendamento) {
      const updatedAgendamento = {
        ...editandoAgendamento,
        nome_cliente: nomeCliente,
        servico,
        valor_orcamento: parseFloat(valorOrcamento),
      };

      try {
        const response = await fetch(`http://192.168.1.200:3000/api/agendamentos/${editandoAgendamento.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedAgendamento),
        });

        if (response.ok) {
          const agendamentosAtualizados = agendamentos.map((item) =>
            item.id === editandoAgendamento.id ? updatedAgendamento : item
          );
          setAgendamentos(agendamentosAtualizados);
          setModalVisible(false);
          setEditandoAgendamento(null);
        } else {
          Alert.alert('Erro', 'Não foi possível salvar as alterações.');
        }
      } catch (error) {
        console.error('Erro ao editar agendamento:', error);
        Alert.alert('Erro', 'Não foi possível editar o agendamento.');
      }
    }
  };

  const excluir = (id: number, nome_cliente: string) => {
    setAgendamentoExcluir({ id, nome_cliente });
    setModalExcluirVisible(true);
  };

  const confirmarExclusao = async () => {
    if (excluirAgendamento) {
      try {
        const response = await fetch(`http://192.168.1.200:3000/api/agendamentos/${excluirAgendamento.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const agendamentosAtualizados = agendamentos.filter(
            (item) => item.id !== excluirAgendamento.id
          );
          setAgendamentos(agendamentosAtualizados);
          setModalExcluirVisible(false);
          setAgendamentoExcluir(null);
        } else {
          Alert.alert('Erro', 'Não foi possível excluir o agendamento.');
        }
      } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        Alert.alert('Erro', 'Não foi possível excluir o agendamento.');
      }
    }
  };

  const cancelarExclusao = () => {
    setModalExcluirVisible(false);
    setAgendamentoExcluir(null);
  };

  const renderItem = ({ item }: { item: Agendamento }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nome_cliente}</Text>
      <Text style={styles.details}>Data: {formatarData(item.data)}</Text>
      <Text style={styles.details}>Hora: {formatarHora(item.hora)}</Text>
      <Text style={styles.details}>Serviço: {item.servico}</Text>
      <Text style={styles.details}>Valor: R$ {item.valor_orcamento.toFixed(2).replace('.', ',')}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => editar(item)}>
          <Ionicons name="pencil" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => excluir(item.id, item.nome_cliente)}>
          <Ionicons name="trash" size={24} color="#FF6347" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gerenciar Agendamentos</Text>
      <FlatList
        data={agendamentos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />

      {}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Agendamento</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do Cliente"
              value={nomeCliente}
              onChangeText={setNomeCliente}
            />
            <TextInput
              style={styles.input}
              placeholder="Serviço"
              value={servico}
              onChangeText={setServico}
            />
            <TextInput
              style={styles.input}
              placeholder="Valor"
              value={valorOrcamento}
              onChangeText={setValorOrcamento}
              keyboardType="numeric"
            />
            <View style={styles.buttonWrapper}>
              <View style={styles.modalActions}>
                <View style={styles.buttonSpacing}>
                  <Button title="Salvar" onPress={salvarEdicao} />
                </View>
                <View style={styles.buttonSpacing}>
                  <Button title="Cancelar" onPress={() => setModalVisible(false)} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalExcluirVisible}
        onRequestClose={cancelarExclusao}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Tem certeza que deseja excluir o agendamento de {excluirAgendamento?.nome_cliente}?
            </Text>

            <View style={styles.modalActions}>
              <Button title="Confirmar" onPress={confirmarExclusao} />
              <Button title="Cancelar" onPress={cancelarExclusao} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// css
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
    marginBottom: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    marginBottom: 15,
    padding: 10,
  },

  buttonWrapper: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
  },
  buttonSpacing: {
    marginHorizontal: 14,
  },
});

export default gerenciamentoAgendamentos;