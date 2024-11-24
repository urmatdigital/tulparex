export async function createCounterparty(name: string) {
  const response = await fetch('/api/moysklad', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    throw new Error('Ошибка при создании контрагента');
  }

  return response.json();
}