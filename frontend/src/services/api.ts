export async function getState() {
  const res = await fetch("http://localhost:5000/state");
  return res.json();
}