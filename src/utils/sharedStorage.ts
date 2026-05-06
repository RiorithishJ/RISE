export async function saveSharedData(key: string, data: any) {
  try {
    await fetch('http://localhost:3000/api/shared-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: data, updatedAt: new Date().toISOString() }),
    });
  } catch (e) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export async function loadSharedData(key: string) {
  try {
    const res = await fetch('http://localhost:3000/api/shared-data');
    const data = await res.json();
    return data[key] || null;
  } catch (e) {
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : null;
  }
}
