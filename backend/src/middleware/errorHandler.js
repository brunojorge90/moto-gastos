const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Registro duplicado' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referência inválida' });
  }

  if (err.code === '22P02') {
    return res.status(400).json({ error: 'UUID inválido' });
  }

  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(status).json({ error: message });
};

export default errorHandler;
