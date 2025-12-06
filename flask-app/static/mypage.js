window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/api/stats");
  const data = await res.json();

  document.getElementById("username").textContent = data.username;
  document.getElementById("count").textContent = data.task_count;
  document.getElementById("rate").textContent =
    Math.round(data.done_rate * 100) + "%";
});
