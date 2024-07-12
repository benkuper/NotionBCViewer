import { writable } from "svelte/store";

export const databases = writable(null);

fetch("https://benjamin.kuperberg.fr/bc2024/databases.php", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        pass: "mile4ever",
    }),
})
    .then((response) => response.json())
    .then((data) => {
        if (data.error != undefined) {
            console.error("Error fetching databse :", data.error);
            return;
        }
       
        databases.set(data);
    });