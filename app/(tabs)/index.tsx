import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';

interface Agendamento {
  id: string;
  nome_cliente: string;
  data: string;
  hora: string;
  servico: string;
  valor_orcamento: number;
}

export default function AgendamentosScreen() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  useEffect(() => {
    const responseAgendamentos = async () => {
      try {
        const response = await axios.get('http://192.168.1.200:3000/api/clientes');
        console.log(response.data);
        setAgendamentos(response.data);
      } catch (error) {
        Alert.alert('Erro', 'Erro no sistema.');
      }    
    };

    responseAgendamentos();
  }, []);

  const formatDate = (data: string, hora: string): string => {
    const [year, mouth, day] = data.split('-');
  
    const formatDay = day.padStart(2, '0');
    const formatMonth = mouth.padStart(2, '0');
    const formatHour = hora.substring(0, 5);

    return `${formatDay}/${formatMonth}/${year} - ${formatHour}`;
  };  

  const renderItem = ({ item }: { item: Agendamento }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.nome_cliente}</Text>
      <Text style={styles.cardText}>{formatDate(item.data, item.hora)}</Text>
      <Text style={styles.cardText}>{item.servico}</Text>
      <Text style={styles.cardText}>{`R$ ${item.valor_orcamento.toFixed(2)}`}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendamentos</Text>
      <FlatList
        data={agendamentos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f9',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 3,
  },
  btnCadastrar: {
    backgroundColor: '#4CAF50',
  },
  btnGerenciar: {
    backgroundColor: '#FF5722',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  cardButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
});