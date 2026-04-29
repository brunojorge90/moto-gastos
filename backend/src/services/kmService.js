/**
 * Calcula o KM atual projetado da moto com base na média diária e data de referência.
 * km_atual = km_inicial + (media_diaria_km * diasDesdeReferencia)
 */
export const calcularKmAtual = (moto) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataRef = new Date(moto.data_referencia);
  dataRef.setHours(0, 0, 0, 0);

  const diffMs = hoje - dataRef;
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const kmAtual = parseFloat(moto.km_inicial) + parseFloat(moto.media_diaria_km) * diffDias;
  return Math.round(kmAtual * 100) / 100;
};

/**
 * Calcula o KM restante para a próxima manutenção de um tipo.
 * km_proxima = km_ultima_manutencao + intervalo_km
 * km_restante = km_proxima - km_atual
 */
export const calcularKmRestante = (kmAtual, kmUltimaManutencao, intervaloKm) => {
  const kmProxima = parseFloat(kmUltimaManutencao) + parseFloat(intervaloKm);
  const kmRestante = kmProxima - kmAtual;
  return Math.round(kmRestante * 100) / 100;
};

/**
 * Estima a data da próxima manutenção com base nos KM restantes e média diária.
 */
export const estimarDataProximaManutencao = (kmRestante, mediaDiariaKm) => {
  if (kmRestante <= 0) return null;
  const diasRestantes = Math.ceil(kmRestante / parseFloat(mediaDiariaKm));
  const dataEstimada = new Date();
  dataEstimada.setDate(dataEstimada.getDate() + diasRestantes);
  return dataEstimada.toISOString().split('T')[0];
};
